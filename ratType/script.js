const input = document.getElementById("input");
const faded = "rgba(240, 248, 255, 0.5)";
const colors = {
    red: "tomato",
    green: "lightgreen",
    whiteHighlight: "rgba(255, 255, 255, 0.1)"
}
var texts = [
    'Word processors evolved dramatically once they became software programs rather than dedicated machines. They can usefully be distinguished from text editors, the category of software they evolved from. Word processing added to the text editor the ability to control type style and size, to manage lines (word wrap), to format documents into pages, and to number pages.',
    'One morning my friend and I were thinking about how we could plan our summer break away from school. Driving from our own state to several nearby states would help to expand our limited funds. Inviting six other friends to accompany us would lower our car expenses. Stopping at certain sites would also help us stretch our truly limited travel budget. Yesterday I engaged in an interesting and enlightening discussion about finances.',
    'There are many idiosyncratic typing styles in between novice-style "hunt and peck" and touch typing. For example, many "hunt and peck" typists have the keyboard layout memorized and are able to type while focusing their gaze on the screen. Some use just two fingers, while others use 3-6 fingers. Some use their fingers very consistently, with the same finger being used to type the same character every time, while others vary the way they use their fingers.',
    'Business meetings, and professional recordings can contain sensitive data, so security is something a transcription company should not overlook when providing services. Companies should therefore follow the various laws and industry best practice, especially so when serving law firms, government agencies or courts. Medical Transcription specifically is governed by HIPAA, which elaborates data security practices and compliance measures to be strictly followed, failure of which leads to legal action and penalties.',
]
//texts = ['The quick brown fox jumped over the lazy dog.'];
var text = "The quick brown fox jumped over the lazy dog.";
var words = text.split(" ");
var letterWordIndexes = [];
var correctKeyStrokes = 0, incorrectKeyStrokes = 0;
var pos = 0;
var currentWord = 0;
var waiting = true;

function getElementsByWordId(wordId) {
    let letters = [];
    for (let i = 0; i < letterWordIndexes.length; i++) {
        if (letterWordIndexes[i] == wordId)
            letters.push(document.getElementById(i));
    }
    return letters;
}

class Timer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.overallTime = 0;
    }
    _getTimeElapsedSinceLastStart() {
        if (!this.startTime)
            return 0;
        return Date.now() - this.startTime;
    }
    start() {
        if (this.isRunning)
            return console.error('Timer is already running');
        this.isRunning = true;
        this.startTime = Date.now();
    }
    stop() {
        if (!this.isRunning)
            return/* console.error('Timer is already stopped')*/;
        this.isRunning = false;
        this.overallTime = this.overallTime + this._getTimeElapsedSinceLastStart();
    }
    reset() {
        this.overallTime = 0;
        if (this.isRunning) {
            this.startTime = Date.now();
            return;
        }
        this.startTime = 0;
    }
    getTime() {
        if (!this.startTime)
            return 0;
        if (this.isRunning)
            return this.overallTime + this._getTimeElapsedSinceLastStart();
        return this.overallTime;
    }
}

function addDecimals(number) {
    let str = number;
    let revStr = [];
    let newStr = "";
    let finalStr = "";
    for (let i = str.length - 1; i >= 0; i--)
        revStr.push(str[i]);
    for (let i = 0; i < revStr.length; i++) {
        newStr += revStr[i];
        if ((i + 1) % 3 == 0 && i != revStr.length - 1)
            newStr += ".";
    }
    for (let i = newStr.length - 1; i >= 0; i--)
        finalStr += newStr[i];
    return finalStr;
}
const timer = new Timer();
setInterval(() => {
    const timeInSeconds = Math.round(timer.getTime() / 1000);
    //document.getElementById('time').innerText = addDecimals(timer.getTime() + "") + "s";
    document.getElementById('time').innerHTML = timeInSeconds + "s";
}, 100);

function initializeText() {
    text = texts[Math.floor(Math.random() * texts.length)];
    words = text.split(" ");
    letterWordIndexes = [];
    correctKeyStrokes = 0;
    incorrectKeyStrokes = 0;
    pos = 0;
    currentWord = 0;
    waiting = true;
    timer.stop();
    timer.reset();
    let p = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] == " ") {
            letterWordIndexes.push(-1);
            p++;
        }
        else
            letterWordIndexes.push(p);
    }
    load();
    highlightLetter(pos, colors.whiteHighlight);
    underlineWord();
}
initializeText();

function load() {
    input.innerHTML = "";
    for (let i = 0; i < text.length; i++)
        input.innerHTML += "<span class='letter' id='" + i + "'>" + text[i] + "</span>";
}
function colorLetter(index, color) {
    document.getElementById(index).style.color = color;
}
function highlightLetter(index, color) {
    let letters = document.getElementsByClassName("letter");
    for (let i = 0; i < letters.length; i++)
        letters[i].style.backgroundColor = "rgba(0, 0, 0, 0)";
    document.getElementById(index).style.backgroundColor = color;
}
function underlineWord() {
    let currentWordLetters = getElementsByWordId(currentWord);
    for (let i = 0; i < text.length; i++)
        document.getElementById(i).style.textDecoration = "";
    for (let i = 0; i < currentWordLetters.length; i++)
        currentWordLetters[i].style.textDecoration = "underline";
}

function finish() {
    let letters = document.getElementsByClassName("letter");
    let correct = 0, incorrect = 0;
    let finalText = "";
    for (let i = 0; i < letters.length; i++) {
        if (letters[i].style.color == colors.green)
            correct++;
        else
            incorrect++;
        finalText += letters[i].innerHTML;
    }
    let words = finalText.replace(".", "").split(" ");
    let timeInSeconds = Math.round(timer.getTime() / 1000);
    timer.stop();
    let accuracy = Math.round((correctKeyStrokes / (correctKeyStrokes + incorrectKeyStrokes)) * 100);
    let grossWpm = Math.round(words.length / (timeInSeconds / 60));
    let uncorrected = 0;
    for (let i = 0; i < text.length; i++) {
        if (document.getElementById(i).style.color == colors.red)
            uncorrected++;
    }
    let wpm = Math.round(grossWpm - (uncorrected / (timeInSeconds / 60)));
    if (wpm < 0)
        wpm = 0;
    document.getElementById("wpm").innerHTML = wpm + " WPM";
    document.getElementById("accuracy").innerHTML = "At " + accuracy + "% Accuracy";
    document.getElementById("grossWpm").innerHTML = "Gross WPM: " + grossWpm;
    togglePopup("scoreReport");
    waiting = false;
    //alert(wpm + "wpm  |  Accuracy: " + accuracy + "%");
}

document.addEventListener("keydown", function (e) {
    if (pos > text.length - 1)
        return;
    let k = e.key;
    if (k == "Shift")
        return;
    else if (k == "Backspace") {
        if (pos <= 0)
            return;
        pos--;
        colorLetter(pos, faded);
        highlightLetter(pos, colors.whiteHighlight);
    }
    else if (k == " " && text[pos] != " ") {
        if (currentWord >= words.length - 1)
            return;
        let newPos = getElementsByWordId(currentWord + 1)[0].id * 1
        for (let i = pos; i < newPos; i++) {
            incorrectKeyStrokes++;
            colorLetter(i, colors.red);
        }
        pos = newPos;
        highlightLetter(pos, colors.whiteHighlight);
    }
    else if (k == text[pos]) {
        correctKeyStrokes++;
        colorLetter(pos, colors.green);
        pos++;
        if (pos < text.length)
            highlightLetter(pos, colors.whiteHighlight);
    }
    else {
        incorrectKeyStrokes++;
        colorLetter(pos, colors.red);
        pos++;
        if (pos < text.length)
            highlightLetter(pos, colors.whiteHighlight);
    }
    if (!timer.isRunning && waiting)
        timer.start();

    if (pos >= text.length) {
        finish();
        return;
    }

    // Get last index of word:
    let lastIndex = 0;
    for (let i = 0; i < letterWordIndexes.length; i++) {
        if (letterWordIndexes[i] * 1 == currentWord)
            lastIndex = i;
    }
    if (pos > lastIndex + 1) {
        // Check if user typed word correctly:
        /*let indexes = getElementsByWordId(currentWord);
        for (let i = 0; i < indexes.length; i++) {
            if (indexes[i].style.color == colors.red) {
                pos--;
                return;
            }
        }*/
        currentWord++;
    }
    underlineWord();
});

function togglePopup(popupName) {
    let popup = document.getElementById(popupName);
    if (popup.style.display == 'none')
        popup.style.display = 'inline';
    else
        popup.style.display = 'none';
}

document.getElementById("playAgain").addEventListener("mousedown", function () {
    initializeText();
    togglePopup("scoreReport");
});