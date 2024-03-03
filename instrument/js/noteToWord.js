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
    }

    addWordToContext(word) {
        this.context.push(word);
    }

    updateContext(newContext) {
        if (typeof newContext === 'string') {
            this.context = parseText(newContext);
        } else {
            this.context = newContext;
        }
    }

    noteToWord(note) {
        return note.ToString();
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

    noteToWord(note) {
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

    noteToWord(note) {
        return this.noteToWordByBert(note);
    }
}

let llamaWorderMixin = {
    // curl http://localhost:11434/api/generate -d '{
    // "model": "llama2",
    // "prompt": "Why is the sky blue?",
    // "options": {
    //     "num_ctx": 4096
    // }
    // }'
    noteToWordByLlama(note) {
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
            console.log("Ollama:", parsed);
            return parsed;
          })
    },

    noteToWord(note) {
        return this.noteToWordByLlama(note);
    }
}

