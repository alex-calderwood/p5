var inputs = [];

var bbox = null;
// variables to center the window
var xOffset = null;
var yOffset = null;

var dots = [];
var w = [0, 0, 0];         // weight vector
var separator = []; // seperator (x, y), (x, y)

var entered = false;
var debug = true;

function setup() {

    bbox = [windowWidth, windowHeight * (3/4)];
    xOffset = bbox[0] * 1/2;
    yOffset = bbox[1] * 1/2;

    smooth();
    canvas = createCanvas(bbox[0], bbox[1]);
    frameRate(5);

    createElement('br')
    let w1 = createInput('0');
    let w2 = createInput('0');
    let b = createInput('0');

    inputs = [w1, w2, b];
    separator = [createVector(0, 0), createVector(0, 0)]

    placeDots();

    textAlign(CENTER)
}

function draw() {
    // Background
    background(color(255, 255, 255, 255));
    drawBackground(separator);

    // Draw the points
    strokeWeight(0);
    for (let dot of dots) {

        var dotProduct = (w[0] * dot.position.x) + (w[1] * dot.position.y) + w[2];

        // Save the value
        dot.dot = dotProduct;

        if ((dotProduct > 0 && dot.class) || (dotProduct <= 0 && !dot.class)) {
            fill(100, 100, 100, 100)
        } else {
            fill(100, 110, 190, 200);
        }

        circle(dot.position.x + xOffset, dot.position.y + yOffset, 6);
        
        if (debug) {
            fill(0, 0, 0, 100)
            noStroke();
            text(dot.position.x.toFixed(0) + ' ' + dot.position.y.toFixed(0) + '\n' + dot.dot.toFixed(0), dot.position.x + xOffset, dot.position.y + yOffset + 14)
        }
    }

    // Debug text / debug points
    stroke(50, 50, 50, 255);
    strokeWeight(0);
    fill(0, 190, 190, 255);
    if (debug) {
        line(separator[0].x + xOffset, separator[0].y + yOffset,
        separator[1].x + xOffset, separator[1].y + yOffset);
        circle(xOffset, yOffset, 5);
        circle(xOffset - w[2], yOffset, 5);
    }
}

function drawBackground(separator) {
    // Sort points 
    if (separator[0].x < separator[1].x) {
        // temp = separator[0];
        // separator[0] =  separator[1];
        // separator[1] = temp;

        bottomCorner = createVector(0, 0);
        topCorner = createVector(0, bbox[1]);
    } else {
        bottomCorner = createVector(bbox[0], 0);
        topCorner = createVector(bbox[0], bbox[1]);
    }

    fill(100, 100, 100, 100)
    beginShape();
        vertex(bottomCorner.x, bottomCorner.y);
        vertex(topCorner.x, topCorner.y);

        vertex(separator[0].x + xOffset, separator[0].y + yOffset);
        vertex(separator[1].x + xOffset, separator[1].y + yOffset);
        vertex(bottomCorner.x, bottomCorner.y);
    endShape(CLOSE);

    strokeWeight(1);
    fill('black')
    line(separator[0].x + xOffset, separator[0].y + yOffset, separator[1].x + xOffset, separator[1].y + yOffset);
}

function placeDots() {
    let numDots = 300;
    for (let i = 0; i < numDots; i ++) {
        dots.push( {
            position: createVector(random(bbox[0]) - xOffset, random(bbox[1]) - yOffset),
            class: random([ 0, 1 ])
        });
    }
}

function keyPressed() {
    if (keyCode === ENTER) {
        entered = true;
        
        var w1 = parseFloat(inputs[0].value());
        var w2 = parseFloat(inputs[1].value());
        var b = parseFloat(inputs[2].value());

        if (isNaN(w1)) {
            w1 = 0;
        }
        if (isNaN(w2)) {
            w2 = 0;
        }
        if (isNaN(b)) {
            b = 0;
        }

        // set w vector globally
        w = [w1, w2, b];

        // calculate linear sepeator coordinates
        var m; // slope
        if ( w2 == 0 && w1 != 0) { // vertical line
            separator[0].x = -b / w1;
            separator[0].y = -yOffset;
    
            separator[1].x = -b / w1;
            separator[1].y = yOffset;
        } else {
            if ( b == 0) {
                m = - w1 / w2;
            } else {
                // // solve for two points by setting dotproduct to 0
                let p1 = createVector(0, -b / w2); // y intercept
                let p2 = createVector(-b / w1, 0); // x intercept
                m = ( p1.y - p2.y ) / (p1.x - p2.x);
            }
    
            separator[0].x = -xOffset;
            separator[0].y = m * -xOffset - (b / w2);
    
            separator[1].x = xOffset;
            separator[1].y = m * xOffset - (b / w2);
        }

        if (debug) {
            console.log('m', m, 'w1', w1, 'w2', w2, 'b', b)
            console.log('sep', separator[0].x, separator[0].y, separator[1].x, separator[1].y)
        }
    }
}