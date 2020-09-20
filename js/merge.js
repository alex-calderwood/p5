// live-server

// Parameters
const nWords = 100;

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
        for(let i = 0; i < nWords; i++) {
            let word = new Word(
                Hierarchy.sample(),
                p.createVector(p.random(viewWidth), p.random(viewHeight)), 
                p.createVector(p.random(1), p.random(2))
            );
            console.log(word);
            word.sprite.addToGroup(words);
        }
    }

    p.draw = function() {
        p.background("white");

        // Draw pages
        p.drawSprites();

        words.bounce(words);
        frame ++;
        let s = 100
    }

    class Motion {
        constructor(text) {
            this.motion = Motion.motions[text];
        }

        move(word) {
            // move according to its default motion function
            this.motion.default(word);
        }

        static motions = {
            "thing":    {default: Motion.stop},
            "bird":   {default: Motion.bounce},
            "birds":   {default: Motion.stop},
            "sand":     {default: Motion.fall},
            "rock":    {default: Motion.fall},
            "rocks":    {default: Motion.fall},
        }

        static stop(word) {
            word.sprite.setVelocity(0, 0);
        }

        static bounce(word) {
            // Wall bounce logic
        }

        static fall(word) {
            let v = 2;
            if (word.sprite.poisiton >= viewHeight) {
                word.sprite.poisiton.y = viewHeight;
                word.sprite.velocity.y == 0;
            }
            else if (word.sprite.velocity.y != v)
                word.sprite.setVelocity(0, v);
        }

        static dance = (word) => {
            // if (frame > s * 3.7) {
            //     word1.sprite.velocity.y = 0;
            //     word2.sprite.velocity.y = 0;
            // }
            // else if (frame > s * 3) {
            //     word1.sprite.velocity.y = 1;
            //     word2.sprite.velocity.y = -1;
            // }
            // else if (frame > s * 2.6) {
            //     word1.sprite.velocity.y = 0;
            //     word2.sprite.velocity.y = 0;
            // }
            // else if (frame > s * 2.2) {
            //     word1.sprite.velocity.y = -1;
            //     word2.sprite.velocity.y = 1;
            // }
            // else if (frame > s * 1.7) {
            //     word1.sprite.velocity.y = 0;
            //     word2.sprite.velocity.y = 0;
            // }
            // else if (frame > s) {
            //     word1.sprite.velocity.y = 1;
            //     word2.sprite.velocity.y = -1;
            // }
        }
    }

    class Hierarchy {
        static seed = ["bird", "rock", "sand"]

        static _next = {
            "thing":    {"meta": "nothing", "merge": "things"},

            "bird":   {"meta": "thing",   "merge": "flock"},
            "flock":   {"meta": "thing",   "merge": "flocks"},
            "flocks":   {"meta": "thing",   "merge": "flocks"},

            "sand":     {"meta": "thing",   "merge": "sand"},

            "rock":     {"meta": "thing",   "merge": "rocks"},
            "rocks":    {"meta": "thing",   "merge": "rocks"},
        }

        constructor(text) {
            this.text = text;
            this.properties = Hierarchy._next[this.text];
            console.log('set', text, this.text, this.properties)
        }

        next() {
            this.text = this.properties[this.text];
        }

        merge(other) {
            console.log("merge", this, other);
            if (other.text == this.text) {
                this.text = this.properties["merge"];
                return true;
            } else if (this.properties.meta == other.text || this.text == other.properties.meta){
                this.text = this.properties.meta["merge"];
                return true;
            }
            return false;
        }

        static sample() {
            // Create a random object from the possible hiearchies
            let size = Hierarchy.seed.length;
            let i = p.int(p.random(0, size));
            let text = Hierarchy.seed[i];
            // console.log("sample", Object.keys(Hierarchy._next), i, text, typeof(text));
            return new Hierarchy(text);
        }
    }

    class Word {
        constructor(hierarchy, position, velocity) {
            if (hierarchy.text === undefined)
                throw "Text must be defined to create a word";
            this.hierarchy = hierarchy;

            this.motion = new Motion(hierarchy.text);
            if (this.motion === undefined)
                throw "Motion not defined for word " + this.hierarchy.text;

            p.random(viewHeight);
            this.sprite = p.createSprite(position.x, position.y, 20, 20);

            this.sprite.setVelocity(velocity.x, velocity.y)
            this.sprite.object = this; // point back to this object from within the sprite

            // Override the default sprite draw function
            this.sprite.draw = this.draw.bind(this);
        }

        draw() {
            p.strokeWeight(0.4);
            p.stroke(1);
            p.textSize(fontSize);
            p.rectMode(p.CENTER);
            p.textAlign(p.CENTER, p.CENTER);

            // Move with the currently defined motion
            this.motion.move(this);

            console.log("collision", this.hierarchy);
            // Set the collision bounding box from the text box
            this.bbox = currFont.textBounds(this.hierarchy.text, this.sprite.position.x, this.sprite.position.y, fontSize);
            this.sprite.setCollider("rectangle", this.bbox.x + this.bbox.w / 2, this.bbox.y , this.bbox.w, this.bbox.h);
            // console.log("bbox", this.bbox, "position", this.sprite.position)

            if (false) 
                p.rect(0, 0, this.bbox.w, this.bbox.h)
            p.text(this.hierarchy.text, 0, 0);

            let v = this.sprite.velocity
            if (this.sprite.position.x < 0 || this.sprite.position.x >= viewWidth) {
                this.sprite.setVelocity(-v.x, v.y);
            }
            if (this.sprite.position.y < 0 || this.sprite.position.y >= viewHeight) {
                this.sprite.setVelocity(v.x, -v.y);
            }

            // Check colision
            for (let other of words) {
                if (other == this)
                    continue;
                this.sprite.collide(other, merge);
            }
        }
    }

    function merge(a, b) {
        // Merge two sprites

        a.velocity.add(b.velocity);
        a.velocity.div(2);
        let didMerge = a.object.hierarchy.merge(b.object.hierarchy);
        if (didMerge) {
            b.remove();
        }
    }
}

let myp5 = new p5(sketch);
