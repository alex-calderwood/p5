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
        this.wordOrder = []; // [id, id, id]
        this.lineHeight = 20; // Keep track of the tallest word in the current line
    }

    draw() {

        background(0)

        let currentX = 0;
        let currentY = 0;

        for (let wordID of this.wordOrder) {
            let word = this.words[wordID];
            textSize(word.size);

            if (currentX + word.width > windowWidth) {
                currentX = 0;
                currentY += this.lineHeight;
            }
            if (currentY + word.size > windowHeight) {
                textColor = [random(255), random(255), random(255)];
                backgroundColor = [255 - textColor[0], 255 - textColor[1], 255 - textColor[2]];
                currentX = 0;
                currentY = 0;
            }

            word.x = currentX;
            word.y = currentY;

            fill(word.backgroundColor[0], word.backgroundColor[1], word.backgroundColor[2]); // set the color to the word's background color
            rect(word.x, word.y, word.x + word.wordWidth, word.y + word.size); // draw the background
            fill(word.color[0], word.color[1], word.color[2]); // set the color to the word's color
            text(word.word, word.x, word.y + word.size); // draw the word

            currentX += word.width + textWidth(" ");

        }
    }

    updateWord(id, word) {
        this.words[id].word = word;
        textSize(this.words[id].size);
        this.words[id].wordWidth = textWidth(word);
    }

    addWord(word) {
        let id = word.id;
        let size = this.lineHeight;
        textSize(size);
        let wordWidth = textWidth(word.word);
        
        let wordColor = textColor;
        let wordBackgroundColor = backgroundColor;
        let aiColor = [200, 0, 0];

        // add performance data to the word
        this.words[id] = {...word, ...{
            size: size,
            width: wordWidth,
            color: word.ai ? aiColor : wordColor,
            backgroundColor: wordBackgroundColor,
        }};
    
        if (word.after) {
            console.log("Adding word after", word);
            let index = this.wordOrder.indexOf(word.after);
            console.log("Index of after word", index);
            if (index === -1) {
                this.wordOrder.unshift(id);
            } else {
                this.wordOrder.splice(index + 1, 0, id);
            }

            delete word.after;

        } else {
            this.wordOrder.push(id);
        }

        return id;
    }

    deleteWord(id) {
        delete this.words[id];
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
        performer.addWord(data.word);
        window.parent.postMessage({type: "addWord", id: data.word.id, status: "success"}, expectedOrigin);
    }   
});


function draw() {
    background(0, 0, 0, 3)
    performer.draw();
}
