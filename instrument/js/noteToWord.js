let bert_url = 'http://localhost:5000';

function parseText(text) {
    let doc = nlp(text);
    let sentences = doc.json();
    let words = sentences.map(sentence => sentence.terms.map(term => term.text)).flat()
    return words;
}

function taggedText(text, tag) {
    let doc = nlp(text);
    let match = doc.match(tag).out('array');
    return match;
}

function callBERT(leftwords, rightwords, badwords) {
    try {
        return fetch(base_url + '/bert', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                leftwords: leftwords,
                rightwords: rightwords,
                badwords: badwords,
            }),
            mode: 'cors'
        }).then(response => {
            return response.json()
        })
        .then(word => {
            word = word.toUpperCase();
            word = word.replace("##", "") // Eventually we may want to concat these
            return word;
        })
    } catch (error) {
        return null;
    }
}

class Worder {
    constructor() {
        this.words = {}; // {id: {word: "word", x: 0, y: 0, size: 0, wordWidth: 0}}
        this.wordOrder = []; // [id, id, id]
        this._nextWordID = 0;
        this.guitarNoteRange = [40, 89];
    }

    noteToWords(note) {
        let words = this._noteToWordsProtocol(note)
        return words.map(this.formatWord.bind(this))
    }

    _preprocessNote(note) {
        if (note.source == "keyboard") {
            return note;
        }
        note.note = note.note - this.guitarNoteRange[0];  
        return note;      
    }
    
    /* 
    * This function is for the Worder mixin to implement. It should take a note and return a word.
    */
    _noteToWordsProtocol(note) {
        note = this._preprocessNote(note);
        return [note.note.ToString()];
    }

    addWordToContext(word) {
        this.words[word.id] = word;
        if (word.after) {
            console.log("Adding word after", word);
            let index = this.wordOrder.indexOf(word.after);
            console.log("Index of after word", index);
            if (index === -1) {
                this.wordOrder.unshift(word.id);
            } else {
                this.wordOrder.splice(index + 1, 0, word.id);
            }
            delete word.after;
        } else {
            this.wordOrder.push(word.id);
        }
    }

    updateContext(newContext) {
        this.words = {}
        this.wordOrder = [];

        let tokenized;
        if (typeof newContext === 'string') {
            tokenized = parseText(newContext);
        } else {
            tokenized = newContext;
        }
        
        for(let word of tokenized) {
            this.addWordToContext(this.formatWord(word));
        }
    }

    getContextData() {
        return this.wordOrder.map(id => this.words[id]);
    }
 
    getContext() {
        return this.wordOrder.map(id => this.words[id].word);
    }

    formatWord(word) {
        return {
            id: this.nextID(),
            word: word,
        }
    }

    nextID() {
        return this._nextWordID++;
    }

    curLineLength() {
        let words = this.getContextData();
        let lastLineLength = words.length;
        for (let i = words.length - 1; i >= 0; i--) {
            let word = words[i];
            if (word.word == '\n') {
                lastLineLength = words.length - i;
                break;
            }
        }
        return lastLineLength;
    }
}

let indexWorderMixin = {
    setCorpus(corpus) {
        this.corpus = parseText(corpus);
    },

    noteToWordsByIndex(note) {
        note = this._preprocessNote(note);
        this.lastWord = this.corpus[note % this.corpus.length];
        return [this.lastWord];
    },

    _noteToWordsProtocol(note) {
        return this.noteToWordsByIndex(note);
    }
}


let phraseWorderMixin = {
    setCorpus(corpus) {
        this.corpus = parseText(corpus);
        let merged = [];
        for (let i = 0; i < this.corpus.length; i += 2) {
            merged.push(this.corpus[i] + " " + this.corpus[i + 1]);
        }
        this.corpus = merged;
    },

    noteToWordsByPhrase(note) {
        note = this._preprocessNote(note);
        console.log(note, this.corpus);
        this.lastWord = this.corpus[note.note % this.corpus.length];
        return this.lastWord.split(' ')
    },

    _noteToWordsProtocol(note) {
        return this.noteToWordsByPhrase(note);
    }
}

let bertWorderMixin = {
    noteToWordsByBert(note) {
        note = this._preprocessNote(note);
        let leftwords = this.getContext().slice(-5);
        let rightwords = [];
        let badwords = [];
        
        return callBERT(leftwords, rightwords, badwords).then(word => {
            return [word];
        });
    },

    _noteToWordsProtocol(note) {
        return this.noteToWordsByBert(note);
    }
}

let llamaWorderMixin = {
    noteToWordsByLlama(note) {
        note = this._preprocessNote(note);
        try {
            let context = this.getContext().join(' ');
        prompt = "<This a dadaist poem. Generated by AI and love.>\n\n" + context
        return fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama2:7b-text",
                prompt: prompt,
                options: {
                    num_predict: 5,
                    num_ctx: 300
                }
            }),
            mode: 'cors'
        }).then(response => {
            return response.text();
        }).then(text => {
            const jsonLines = text.trim().split('\n'); // Split the text by newlines
            const jsonData = jsonLines.map(line => JSON.parse(line)); // Parse each line as JSON
            console.log(jsonData)
            let words = jsonData.map(data => data['response'].toUpperCase())
            let lastSpace = words.length;
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                if (word != '' && word[0] == ' ') {
                    lastSpace = i;
                }
            }
            words.splice(lastSpace, words.length - lastSpace);
            words = words.join('');
            const parsed = parseText(words);
            const final = parsed.map(this.formatWord.bind(this))
            console.log("Ollama", parsed, "context", context);

            return final;
          })
        } catch (error) {
            return null;
        }
        
    },

    _noteToWordsProtocol(note) {
        return this.noteToWordsByLlama(note);
    }
}