let center;
// var colors = []
let saturation, value;
let lineWidth;
let g1;

var currentTime = 0;

// Setting 1 - corchestra

// let mod = 1;
// var maxK = 20000;
// var minK = 1500;
// const FR = 4;
// const dMin = 0, dMax = 2;
// const modMin = 1, modMax = 1;
// const dt = 0.1;
// const backgroundAlpha = 100;
// const modAddRange = 5;

// Setting 2 - beam
var maxK = 20000;
var minK = 1500;
const FR = 12;
const dMin = 1, dMax = 1;
const modMin = 0, modMax = 0;
const dt = 0.1;
const backgroundAlpha = 70;
const modAddRange = 0;
let mod = 1;
let holdMod = 1

var prevPoint;

var mode = false;
var i = 0;

function setup() {
    prevPoint = createVector(0, 0);
    var c = createCanvas(windowWidth, windowHeight);

    center = createVector(windowWidth /2, windowHeight / 2);
    colorMode(RGB, 255);
    frameRate(FR);

    currentTime = (currentTime + 0.05);
    // let currentTime = currentHourAsFloat();
    // let K = hourToK(currentTime);
    // g1 = tempToRGB(K);

    background(0);

    lineWidth = random(10, 90);


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

function drawTick(point, c, frame) {

    if (mode) {
        rect(
            point.x,
            0,
            4,
            windowHeight
        );
    } else {
        rect(
            prevPoint.x,
            0,
            4 + i,
            windowHeight
        )
    }
    
    strokeWeight(0);
    fill(c);

    if (frame % (FR * holdMod) == 0) {
        prevPoint = point;
        mode = !mode;
        i = 0;
        holdMod = random(0.3, 4);
    }
    i ++;
}

function draw() {
    currentTime = (currentTime + dt);
    // let currentTime = currentHourAsFloat();
    let K = hourToK(currentTime);
    g1 = tempToRGB(K);

   background(0,0,0,backgroundAlpha);
    var start = createVector(0, 0);
    // var dist = 3;
    var dist = random(dMin, dMax);
    if(frameCount % mod == 0) {
        let moddedDist = (dist * frameCount) % windowWidth;
        var point = start.copy().add(moddedDist, 0);
//        var point = center;
        drawTick(point, g1, frameCount);
    }
    // mod += Math.floor(random(-modAddRange, modAddRange));
    // mod = max(min(mod, modMax), modMin);
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

    // console.log(temp, r, g, b);
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