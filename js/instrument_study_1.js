let textArray;
let start;

let textS = 16
let startX;

let speeds = []
let xLocs = []

let midiAccess;
let curMessage;
let textLocation = [0, 40];
let color = [0, 0, 0];
let monoSynth;
let command, note, velocity;
let range = [0, 120];

let slidyWindow;
let knobs;

let grammarIndex = 0;
let grammar = [
    "comedy",
    "tragedy",
    "history",
    "romance",
    "tragicomedy",
    "fantasy",
    "musical",
    "melodrama"
];

let realization = [];

class Knobs {
    constructor() {
        this.knobs = new Array(8).fill(0);
    }

    set(index, value) {
        this.knobs[index] = value;
        console.log(index, this.knobs[index]);
        this.draw();
    }

    get(index) {
        return this.knobs[index];
    }

    draw() {
        let baseX = 0;
        let baseY = slidyWindow.loc[3];
        let fullW = 50;
        let fullH = 50;
        noStroke();
        for (let i = 0; i < this.knobs.length; i++) {
            let x = baseX + (i % this.knobs.length / 2) * fullW;
            let y = baseY + ((i / this.knobs.length / 2) * fullH);
            let w = this.knobs[i] / 127 * fullW;
            let h = fullH;
            console.log(i, x, y, x + fullW, y + fullH);
            fill(100);
            rect(x, y, x + fullW, y + fullH);
            fill(122);
            rect(x, y, x + w, y + h);
        }
    }
}

class SlidyWindow {
    constructor(loc) {
        this.loc = loc;
        this.selectedTrack = 0;
        this.trackHeight = 20;
    }

    draw() {
        fill(0);
        noStroke();
        rect(this.loc[0], this.loc[1], this.loc[2], this.loc[3]);

        textSize(textS);
        for (let i = 0; i < textArray.length; i++) {
            fill(128+(i*10));
            text(textArray[i], xLocs[i], i*this.trackHeight);
            xLocs[i] -= speeds[i]

            if (xLocs[i] < -textWidth(textArray[i])) {
                // xLocs[i] = windowWidth;
                realization.push(textArray[i]);
                textArray[i] = "";
                xLocs[i] = windowWidth;
            }
        }

        // draw red outline around selected track
        let trackX = this.loc[0];
        let trackY = this.loc[1] +  (this.selectedTrack * this.trackHeight);
        let trackW = this.loc[2];
        let trackH = this.trackHeight;
        stroke(230, 10, 10);
        strokeWeight(2);
        noFill();
        rect(trackX, trackY, trackX + trackW, trackY + trackH);

        noStroke();
    }
}

function setup() {
    noStroke();
    createCanvas(windowWidth, windowHeight);
    rectMode(CORNERS);
    textAlign(LEFT, TOP);

    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({sysex: false}).then(onMIDISuccess, onMIDIFailure);
    } else {
        console.warn("WebMIDI is not supported in this browser.");
    }

    color = [random(255), random(255), random(255)];
    monoSynth = new p5.MonoSynth();

    startX = windowWidth;
    start = createVector(0, 0)
    frameRate(26)

    for(let tweet of textArray) {
        speeds.push(3);
        xLocs.push(startX)
    }

    slidyWindow = new SlidyWindow([0, 0, windowWidth, windowHeight - 100]);
    textLocation = [windowWidth - 100, slidyWindow.loc[3]];

    knobs = new Knobs();
    knobs.draw();
}

function onMIDISuccess(midi) {
    midiAccess = midi;
    let inputs = midiAccess.inputs.values();
    for (let input of inputs) {
        input.onmidimessage = handleMIDIMessage;
    }
}

function onMIDIFailure() {
    console.error('Could not access MIDI devices.');
}

function handleMIDIMessage(message) {
    curMessage = message;
    const channelIndex = message.data[0] & 0x0F;
    const eventType = message.data[0] >> 4;

    command = message.data[0];
    note = message.data[1];
    velocity = (message.data.length > 2) ? message.data[2] : 0;

    // debugging
    fill(0);
    textSize(10);
    fill(0);
    rect(textLocation[0], textLocation[1], textLocation[0] + 100, textLocation[1] + 50);
    fill(255);
    text('Command: '  + command,      textLocation[0], textLocation[1]);
    text('Note: '     + note,         textLocation[0], textLocation[1] + 10);
    text('Velocity: ' + velocity,     textLocation[0], textLocation[1] + 20);
    text('Channel: '  + channelIndex, textLocation[0], textLocation[1] + 30);
    text('Event: '    + eventType,    textLocation[0], textLocation[1] + 40);


    if (eventType === 9) { // Note on message
        let x = s(range[0], range[1], 0, width, note);
        let y = s(0, 127, 0, height, velocity);
        y = windowHeight - y;
        fill(color[0], color[1], color[2]);
        updateColor();

        playSynth();
        if (slidyWindow.selectedTrack >= textArray.length) {
            textArray.push(grammar[note % grammar.length]);
            xLocs.push(startX);
            speeds.push(3);
        } else {
            textArray[slidyWindow.selectedTrack] = grammar[note % grammar.length];
            xLocs[slidyWindow.selectedTrack] = startX;
            speeds[slidyWindow.selectedTrack] = 3;
        }
        // grammarIndex++;
        // grammarIndex %= grammar.length;
        slidyWindow.selectedTrack++
    }
    else if (eventType === 8) { // Note off message
        offSynth();
    }
    else if (eventType === 11) { // Control change message
        if (note === 1) { // Modulation wheel
        }
        else if (note === 7) { // Volume
        }
        else if (note === 10) { // Pan
        }
        else if (note === 11) { // Expression
        }
        else if (note === 64) { // Sustain
        }
        else if (70 <= note && note <= 79) { // General Purpose Controllers
            knobs.set(note - 70, velocity);
        }
        else if (note === 123) { // All notes off
        }
    }
}

function updateColor() {
  color[0] += random(0, 2);
  color[0] %= 256;
  color[1] += random(0, 2);
  color[1] %= 256;
  color[2] += random(0, 2);
  color[2] %= 256;
}

function s(start, end, newStart, newEnd, val) { 
  let normed = (val - start) / (end - start);
  return ((normed * (newEnd - newStart) ) + newStart);
}

function resetTexts() {
    textArray = [];
}


function keyPressed() {
  if (keyCode === ENTER) {
    resetTexts();
    background(40);
  } else if (keyCode === RIGHT_ARROW) {
    slidyWindow.selectedTrack++;
  } else if (keyCode === LEFT_ARROW) {
    slidyWindow.selectedTrack--;
  }
  else {
    console.log("Key", keyCode);
    handleMIDIMessage({
        data: [
            144,
            keyCode,
            100
        ]
    });
    return false; // suppress default
  }

}

function playSynth() {
  monoSynth.triggerAttack(note, velocity);
  console.log(velocity);
}

function offSynth() {
    monoSynth.triggerRelease();
}


function preload() {
  textArray = []
  console.log(textArray.length)
}

function draw() {
    slidyWindow.draw();

    // textSize(textS);
    // for (let i = 0; i < textArray.length; i++) {
    //     fill(128+(i*10));
    //     text(textArray[i], xLocs[i], startY+i*20);
    //     xLocs[i] -= speeds[i]

    //     if (xLocs[i] < -textWidth(textArray[i])) {
    //         // xLocs[i] = windowWidth;
    //         realization.push(textArray[i]);
    //         textArray[i] = "";
    //         xLocs[i] = windowWidth;
    //     }
    // }

    // draw realization
    text(realization.join(" "), 0, 0);
}

function mousePressed() {
//   shuffle(textArray, true);
//   shuffle(speeds, true);

}