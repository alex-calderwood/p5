function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
    background(220);
    for (let i = 0; i < 100; i++) {
        let x = random(width);
        let y = random(height);
        let d = random(10, 30);
        ellipse(x, y, d);
    }
}