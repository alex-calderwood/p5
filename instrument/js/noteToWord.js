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
        // console.log(leftwords, rightwords, badwords, word);
        return word.toUpperCase();
    })
}

class Worder {
    constructor() {
        this.context = [];
        this._nextWordID = 0;
    }
    
    /* 
    * This function is for the Worder mixin to implement. It should take a note and return a word.
    */
    _noteToWordProtocol(note) {
        return note.ToString();
    }

    addWordToContext(word) {
        this.context.push(word.word); // TODO this isn't going to be indexing correctly
    }

    updateContext(newContext) {
        if (typeof newContext === 'string') {
            this.context = parseText(newContext);
        } else {
            this.context = newContext;
        }
    }

    formatWord(word) {
        return {
            id: this.nextID(),
            word: word,
        }
    }

    noteToWord(note) {
        let word = this._noteToWordProtocol(note)
        return this.formatWord(word);
    }

    nextID() {
        return this._nextWordID++;
    }
}

let indexWorderMixin = {
    setCorpus(corpus) {
        this.corpus = parseText(corpus);
    },

    noteToWordByIndex(note) {
        this.lastWord = this.corpus[note % this.corpus.length];
        return this.lastWord;
    },

    _noteToWordProtocol(note) {
        return this.noteToWordByIndex(note);
    }
}

let bertWorderMixin = {
    noteToWordByBert(note) {
        let leftwords = this.context.slice(-5);
        let rightwords = [];
        let badwords = [];
        
        return callBERT(leftwords, rightwords, badwords).then(word => {
            return word;
        });
    },

    _noteToWordProtocol(note) {
        return this.noteToWordByBert(note);
    }
}

let llamaWorderMixin = {
    noteToWordByLlama(note) {
        console.log('using llama')
        let context = this.context.join(' ');
        // console.log('Context: ', context);
        return fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama2:7b-text",
                prompt: context,
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
            console.log("Ollama:", final);
            return final;
          })
    },

    _noteToWordProtocol(note) {
        return this.noteToWordByLlama(note);
    }
}