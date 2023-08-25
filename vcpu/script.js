const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "limegreen";

function setWindowSize() {
    let w = window.innerWidth,
        h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
}
setWindowSize();

window.addEventListener('resize', setWindowSize());

var doc = {
    color: "50,205,50,1",
    fontSize: 32,
    lineHeight: 0,
    lineCount: 0,
    fontFamily: "sans-serif"
}
doc.lineHeight = doc.fontSize + (doc.fontSize / 3);
doc.lineCount = Math.floor(window.innerHeight / doc.lineHeight);

var lines = [];
var objs = [];

class square {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        objs.push(this);
    }

    update() {
        this.draw()
    }

    draw() {
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class textLine {
    constructor(string) {
        this.line = lines.length;
        this.x = 15;
        this.y = this.line * doc.lineHeight + 15;
        this.string = string;
        this.instantiate();
    }

    instantiate() {
        if (lines.length > 1 && lines[lines.length - 1].line >= Math.floor((canvas.height - 15) / doc.lineHeight))
            canvas.height += doc.lineHeight * 2;
        let scrollingElement = (document.scrollingElement || document.body);
        scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }

    draw() {
        ctx.font = doc.fontSize + 'px ' + doc.fontFamily;
        ctx.fillText(this.string, this.x, this.y + doc.fontSize);
    }
}

function writeLine(text) {
    lines.push(new textLine(text));
}

function printLines() {
    for (let i = 0; i < lines.length; i++)
        lines[i].draw();
}

function type(text) {
    time = 0;
    let currentLine = lines[lines.length - 1];
    if (text.length == 1)
        currentLine.string += text;
    else {
        if (text == "Backspace") {
            if (currentLine.string.length < 1) {
                if (lines.length <= 1)
                    return;
                lines.pop();
                return;
            }
            currentLine.string = currentLine.string.substring(0, currentLine.string.length - 1);
        }
        else if (text == "Enter") {
            enter(currentLine.string)
            lines.push(new textLine(""));
        }
    }
}

function enter(text) {
    let functionName = text.substring(0, text.indexOf("("));
    let parameters = text.substring(text.indexOf("(") + 1, text.indexOf(")")).replace(" ", "").split(",");
    for (let i = 0; i < commandList.length; i++) {
        if (commandList[i][0].toLowerCase() == functionName.toLowerCase()) {
            window[commandList[i][0].toLowerCase()](parameters);
            return;
        }
    }
    if (text == "help") {
        help();
        return;
    }
    if (text.indexOf("(") > -1 && text.indexOf(")") > -1)
        writeLine("Command not found, type 'help' for a list of commands.");
}

function drawCaret(time) {
    if (Math.floor(time) % 2 == 0 && lines.length > 0)
        ctx.fillStyle = "rgba(" + doc.color.split(",")[0] + "," + doc.color.split(",")[1] + "," + doc.color.split(",")[2] + "," + doc.color.split(",")[3] * 0.8 + ")";
    else
        ctx.fillStyle = "rgba(" + doc.color.split(",")[0] + "," + doc.color.split(",")[1] + "," + doc.color.split(",")[2] + "," + doc.color.split(",")[3] * 0.1 + ")";
    ctx.fillRect(ctx.measureText(lines[lines.length - 1].string).width + doc.fontSize * 0.55, (lines.length - 1) * doc.lineHeight + doc.lineHeight * 0.47, doc.fontSize * 0.1, doc.fontSize);
    ctx.fillStyle = "rgba(" + doc.color + ")";
}

function objUpdate() {
    for (let i = 0; i < objs.length; i++)
        objs[i].update();
}

function redraw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    printLines();
    drawCaret(time);
    objUpdate();
}

writeLine("Visual CPU v4.0 - Rat Lab 2023");
writeLine("  ~ Type 'help' for a list of commands");
lines.push(new textLine(""));
lines.push(new textLine(""));

let time = 0;
setInterval(function () {
    time += 0.005;
    redraw(time);
}, 1);

document.addEventListener("keydown", function (e) {
    type(e.key);
});

document.addEventListener("keypress", function () {
    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
});

// COMMANDS:

var commandList = [
    ["about", ""],
    ["help", ""],
    ["clear", ""],
    ["add", "num1, num2, ...,"],
    ["subtract", "num1, num2, ...,"],
    ["drawSquare", "x, y, width, height"]
];

function about() {
    writeLine("Here's some info about the Visual CPU:");
    writeLine("  - The Visual CPU is a fun project that represents a mini computer in the web.");
    writeLine("  - The original idea came from a game called 0x10c");
    writeLine("  - The first version of the Visual CPU is demonstrated in Project Endian, found on ratlab.one");
    writeLine("");
}

function help() {
    writeLine("Here are all the available commands:");
    for (let i = 0; i < commandList.length; i++) {
        writeLine("  - " + commandList[i][0] + "(" + commandList[i][1] + ")");
    }
    writeLine("");
}

function clear() {
    lines = [];
    objs = [];
    canvas.height = window.innerHeight;
}

function add(numbers) {
    let temp = "";
    let ans = 0;
    for (let i = 0; i < numbers.length; i++) {
        temp += numbers[i] + " + ";
        ans += numbers[i] * 1;
    }
    temp = temp.substring(0, temp.length - 2);
    temp += "= " + ans;
    writeLine(temp);
    writeLine("");
}

function subtract(numbers) {
    let temp = "";
    let ans = numbers[0];
    temp += numbers[0] + " - ";
    for (let i = 1; i < numbers.length; i++) {
        temp += numbers[i] + " - ";
        ans -= numbers[i] * 1;
    }
    temp = temp.substring(0, temp.length - 2);
    temp += "= " + ans;
    writeLine(temp);
    writeLine("");
}

function drawsquare(params) {
    new square(params[0] * 1, params[1] * 1, params[2] * 1, params[3] * 1);
}