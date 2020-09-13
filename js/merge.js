// live-server

// Parameters
const nWords = 10;

// Sprites
let words;

// Viewbox stuff
let viewWidth, viewHeight;

let currFont; 
let fontSize = 24;

let frame = 0;
let word1, word2;
let a = 1;

let sketch = function(p) {
    
     p.preload = function() { 
        // https://www.geeksforgeeks.org/p5-js-p5-font-textbounds-method/#:~:text=Font%20in%20p5.,font%20it%20is%20used%20upon.&text=line%3A%20It%20is%20a%20String,which%20denotes%20the%20x%2Dposition.
        currFont = p.loadFont("../assets/Open_Sans/OpenSans-Light.ttf"); 
    } 
        
     p.setup = function() {
        viewWidth = p.windowWidth;
        viewHeight = p.windowHeight;

        p.smooth();
        canvas = p.createCanvas(viewWidth, viewHeight);

        // Define the sprite groups
        words = p.Group();

        // Create words
        // for(let i = 0; i < nWords; i++) {
        //     word = createWord();
        //     word.sprite.addToGroup(words);z
        // }
        word1 = new Word(p.createVector(viewWidth / 2, 200), p.createVector(0, 0));
        word2 = new Word(p.createVector(viewWidth / 2, 300), p.createVector(0, 0));
        console.log(word1.sprite.velocity)
        word1.sprite.addToGroup(words);
        word2.sprite.addToGroup(words);
    }

    p.draw = function() {
        p.background("white");

        // Draw pages
        p.drawSprites();

        words.bounce(words);
        frame ++;
        if (frame == 250) {
            word1.sprite.velocity.y = 1;
            word2.sprite.velocity.y = -1;
        }
    }

    class Word {
        constructor(position, velocity) {
            this.text = "person"
            p.random(viewHeight)
            this.sprite = p.createSprite(position.x, position.y, 20, 20);

            this.sprite.setVelocity(velocity.x, velocity.y)
            this.sprite.object = this;

            // Override the default sprite draw function
            this.sprite.draw = this.draw.bind(this);
        }

        draw() {
            p.strokeWeight(0.4);
            p.stroke(1);
            p.textSize(fontSize);
            p.rectMode(p.CENTER);
            p.textAlign(p.CENTER, p.CENTER);

            // Wall bounce logic
            let v = this.sprite.velocity
            if (this.sprite.position.x < 0 || this.sprite.position.x >= viewWidth) {
                this.sprite.setVelocity(-v.x, v.y);
            }
            if (this.sprite.position.y < 0 || this.sprite.position.y >= viewHeight) {
                this.sprite.setVelocity(v.x, -v.y);
            }

            // Set the collision bounding box from the text box
            this.bbox = currFont.textBounds(this.text, this.sprite.position.x, this.sprite.position.y, fontSize);
            this.sprite.setCollider("rectangle", this.bbox.x + this.bbox.w / 2, this.bbox.y , this.bbox.w, this.bbox.h);
            // console.log("bbox", this.bbox, "position", this.sprite.position)

            if (false) 
                p.rect(0, 0, this.bbox.w, this.bbox.h)
            p.text(this.text, 0, 0);

            // Check colision
            for (let other of words) {
                if (other == this)
                    continue;
                this.sprite.collide(other, merge);
            }
        }
    }

    function merge(a, b) {
        a.object.text = "people";
        a.velocity.add(b.velocity);
        a.velocity.div(2);

        b.remove();
    }
}

let myp5 = new p5(sketch);
