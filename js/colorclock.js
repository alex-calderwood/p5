// var K = 1900;
var mainHour = 0;
var maxK = 8000;
minK = 1000;

function setup() {
    smooth();
    canvas = createCanvas(windowWidth, windowHeight);
    frameRate(30);
    strokeWeight(0.3);
    colorMode(RGB, 255)
}

function draw() {
    // background(tempToRGB(K));
    // K += 103;
    // K = K % 8000;
    // console.log(K);
    // background(color(100, 0, 0))
    mainHour += 0.1;
    mainHour = mainHour % 24;
    console.log('h0 ', mainHour);
    let K = hourToK(mainHour);
    let c = tempToRGB(K)
    console.log("K " + K);
    background(c);

}

function clamp(c) {
    return max(0, min(255, c));
}

function hourToK(hour) {
    console.log('h1 ' + hour)
    let sunrise = 6.9; // # 6:55 AM;
    let sunset = 16.9 // # 4:54 PM;
    let newHour = max(sunrise, min(sunset, hour));

    let dayLength = sunset - sunrise;

    let r = dayLength / 2;
    let x = newHour - (sunrise + r);
    let y = sqrt(r * r - x * x);
    let h = y / r;
    let K = h * (maxK - minK) + minK;
    print('hour ', hour, 'r ', r, 'y', y, 'K', K);
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