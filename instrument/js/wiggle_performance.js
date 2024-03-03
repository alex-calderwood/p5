const expectedOrigin = "https://localhost:8101"

let textColor = [255, 255, 255];
let backgroundColor = [0, 0, 0];

function setup() {
    noStroke();
    background(0);

    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container'); // Attach the canvas to the container

    rectMode(CORNERS);
    textAlign(LEFT, BOTTOM);
}
class TextPerformer {
    constructor() {
        this.words = {}; // {id: {word: "word", x: 0, y: 0, size: 0, wordWidth: 0}}
        this.currentX = 0; // Keep track of the current x position for the next word
        this.currentY = 0; // Keep track of the current y position for the next word
        this.lineHeight = 0; // Keep track of the tallest word in the current line
    }

    draw() {
        for (let word of Object.values(this.words)) {
            textSize(word.size);
            fill(word.backgroundColor[0], word.backgroundColor[1], word.backgroundColor[2]); // set the color to the word's background color
            rect(word.x, word.y, word.x + word.wordWidth, word.y + word.size); // draw the background
            fill(word.color[0], word.color[1], word.color[2]); // set the color to the word's color
            text(word.word, word.x, word.y + word.size); // draw the word
        }
    }

    updateWord(id, word) {
        this.words[id].word = word;
        textSize(this.words[id].size);
        this.words[id].wordWidth = textWidth(word);
    }

    addWord(word, options) {
        let id = this.nextID();
        // let size = random(10, 30);
        let size = 20;
        textSize(size);
        let wordWidth = textWidth(word);


        if (this.currentX + wordWidth > windowWidth) {
            // Move to the next line
            this.currentX = 0;
            this.currentY += this.lineHeight;
            this.lineHeight = 0;
        }
        if (this.currentY + size > windowHeight) {
            textColor = [random(255), random(255), random(255)];
            backgroundColor = [255 - textColor[0], 255 - textColor[1], 255 - textColor[2]];
            this.currentX = 0;
            this.currentY = 0;
            this.lineHeight = 0;
        }

        let wordColor = textColor;
        let wordBackgroundColor = backgroundColor;
        let aiColor = [200, 0, 0];

        this.words[id] = {
            word: word,
            x: this.currentX,
            y: this.currentY,
            size: size,
            wordWidth: wordWidth,
            color: options && options.ai ? aiColor : wordColor,
            backgroundColor: wordBackgroundColor,
        };

        this.currentX += wordWidth + textWidth(" ");
        this.lineHeight = max(this.lineHeight, size);

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
        let id = performer.addWord(data.word, data.options);
        window.parent.postMessage({type: "addWord", id: id, status: "success"}, expectedOrigin);
    }   
});


function draw() {
    background(0, 0, 0, 3)
    performer.draw();
}
