const expectedOrigin = "https://localhost:8101"

function setup() {
    noStroke();
    background(0);

    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container'); // Attach the canvas to the container

    rectMode(CORNERS);
    textAlign(LEFT, TOP);
}

class TextPerformer {
    constructor() {
        this.words = {}; // {id: {word: "word", x: 0, y: 0, size: 0}}
    }

    draw() {
        for (let word of Object.values(this.words)) {
            fill(255);
            textSize(word.size);
            console.log("Drawing word: ", word.word, word.x, word.y, word.size)
            text(word.word, word.x, word.y, word.x + word.size, word.y + word.size);
        }
    }

    updateWord(id, word) {
        this.words[id].word = word;
    }

    addWord(word) {
        let id = this.nextID();
        this.words[id] = {
            word: word,
            x: random(width),
            y: random(height),
            size: random(10, 30),
        };
        console.log("Added word: ", this.words[id].word, this.words[id].x, this.words[id].y, this.words[id].size);
        return id;
    }

    deleteWord(id) {
        delete this.words[id];
    }

    nextID() {
        let id = 0;
        while (this.words[id] !== undefined) {
            id++;
        }
        return id;
    }
}

let performer = new TextPerformer();

window.addEventListener("message", (event) => {
    // Always validate the origin of the message!
    if (event.origin !== expectedOrigin) {
        console.log("Message received from unexpected origin: ", event.origin, "which does not match expected origin of ", expectedOrigin);
        return;
    }
    
    let data = event.data.data;

    if (data && data.type === "addWord") {
        let id = performer.addWord(data.word);
        window.parent.postMessage({type: "addWord", id: id, status: "success"}, expectedOrigin);
    }   
});


function draw() {
    background(0, 0, 0, 3)
    performer.draw();
}
