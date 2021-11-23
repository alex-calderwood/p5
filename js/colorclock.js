let center;
// var colors = []
let saturation, value;
let lineWidth;
let g1, g2;
let mod;


var currentTime = 0;
var maxK = 9000;
var minK = 1500;

function setup() {
    var c = createCanvas(windowWidth, windowHeight);

    center = createVector(windowWidth /2, windowHeight / 2);
    colorMode(RGB, 255);
    frameRate(30);

    currentTime = (currentTime + 0.05);
    // let currentTime = currentHourAsFloat();
    let K = hourToK(currentTime);
    g1 = tempToRGB(K);
    g2 = g1;


    backgroundGradient();

    // colors = makeColors()

    lineWidth = random(10, 90);

    mod = Math.floor(random(2, 12));


    // smooth();
    // frameRate(10);
    // strokeWeight(0.3);

}

function makeColors() {
    var colors = []
    var alpha = 1
    for (var i = 0; i < 100; i ++) {
        prev = (prev + random(1,3)) % 256
        colors.push(color());
        alpha = alpha *= 0.96;

    }
    return colors;
}

function drawTick(point, c) {

    rect(
        random(0, windowWidth), 
        random(0, windowHeight),
        10, 10 
        // random(0, windowWidth / 4),
        // random(0, windowHeight / 4)
    );
    
    // var alot = 1000;
    // strokeWeight(0);
    fill(c);

    // beginShape();
    // vertex(point.x - center.x, 0);
    // vertex(point.x, point.y);
    // vertex(point.x - center.x, windowHeight);
    // vertex(point.x - center.x, windowHeight - lineWidth);
    // vertex(point.x - lineWidth, point.y);
    // vertex(point.x - center.x, lineWidth);
    // endShape(CLOSE);
}


function backgroundGradient() {
    noFill();
    for(var i = 0; i < windowWidth; i ++) {
        var interp = map(i, 0, windowWidth, 0, 1)
        stroke(lerpColor(g1, g2, interp));
        strokeWeight(1);
        line(i, 0, i, windowHeight);
    }
}

function draw() {


    currentTime = (currentTime + 0.1);
    // let currentTime = currentHourAsFloat();
    let K = hourToK(currentTime);
    g1 = tempToRGB(K);
    g2 = g1


//    background(g1);

    var start = createVector(0, center.y)

    if(frameCount % mod == 0) {
        var point = start.copy().add(9 * frameCount, 0);
//        var point = center;
        drawTick(point, g1);
    }
}



// function draw() {
//     // background(tempToRGB(K));
//     // K += 103;
//     // K = K % 8000;
//     // console.log(K);
//     // background(color(100, 0, 0))
//     // mainHour += 0.1;

//     
//     // currentTime = getCurrentTime();
//     let kelvin = hourToK(currentTime % 24);
//     let color = tempToRGB(kelvin)
//     background(color);

// }

function clamp(c) {
    return Math.max(0, Math.min(255, c));
}

// hour is always beetween 0 and 24
function hourToK(hour) {
    hour = hour % 24;
    let sunrise = 6.9; // # 6:55 AM;
    let sunset = 16.9 // # 4:54 PM;
    let newHour = Math.max(sunrise, Math.min(sunset, hour));
    
    let dayLength = sunset - sunrise;

    let r = Math.ceil(dayLength / 2);
    let x = newHour - (sunrise + r);

    let y = Math.sqrt(r * r - x * x);
    let h = y / r;
    let K = h * (maxK - minK) + minK;
    return K
}

function tempToRGB(K) {
    let r = g = b = -1;
    let temp = K / 100.0;
    if (temp <= 66) {
        r = 255;
        g = temp;
        g = 99.4708025861 * log(g) - 161.1195681661;
    }
    else {
        r = temp - 60;
        r = 329.698727446 * pow(r, -0.1332047592);
        g = temp - 60;
        g = 288.1221695283 * pow(g, -0.0755148492);
    }

    if (temp >= 66) {
        b = 255;
    } else if (temp <= 19) {
            b = 0;
    } else {
        b = temp - 10;
        b = 138.5177312231 * log(b) - 305.0447927307;
    }
    r = clamp(r);
    g = clamp(g);
    b = clamp(b);
    c = color(r, g, b);

    console.log(temp, r, g, b);
    return color(c);
}

// function to compute the current time
function currentHourAsFloat() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    return h + (m/60) + (s/3600);
}