var word = "";
var table;
var keys;
var wordBank = ["fight", "coder", "flows",
    "class", "seven", "apple", "among", "craft",
    "crime", "depth", "cycle", "fault", "input",
    "pivot", "train", "acute", "zesty", "basic",
    "white", "board", "bored", "broad", "rythm",
    "bowed"];
word = wordBank[Math.floor(Math.random() * wordBank.length)].toUpperCase();
var red = "rgb(255, 75, 75)", green = "rgb(108, 255, 89)", orange = "rgb(255, 195, 74)";
var tries = 6;
var possibleKeys = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'ENTER','BKSP'
];
document.addEventListener('keydown', (event) => {
    var name = event.key.toUpperCase();
    if (name == "BACKSPACE")
        name = "BKSP";
    if (possibleKeys.indexOf(name) > -1)
        ProcessButtons(name);
}, false);
function createTable() {
    var toWrite = "";
    toWrite += ("<table border='1px' id='table'>");
    for (var i = 0; i < tries; i++) {
        toWrite += ("<tr id='row" + i + "'>");
        for (var j = 0; j < 5; j++) {
            toWrite += ("<th id='[" + i + "," + j + "]'> </th>");
        }
        toWrite += ("</tr>");
    }
    toWrite += ("</table>");
    table = document.getElementById("tableDiv");
    table.innerHTML = toWrite;
}
var btns;
function createKeys() {
    var alphabet = "QWERTYUIOPASDFGHJKL4ZXCVBNM3";
    var aCount = 0;
    var toWrite = "";
    var w = 10;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < w; j++) {
            var key = alphabet[aCount];
            if (key == "3")
                key = "ENTER";
            else if (key == "4")
                key = "BKSP";
            toWrite += "<button id='" + key + "' class='kb'>" + key + "</button>";
            aCount++;
        }
        toWrite += "<br>";
        w--;
        if (w == 8)
            w++;
    }
    keys = document.getElementById("keysDiv");
    keys.innerHTML = toWrite;
    document.getElementById("ENTER").className = "kbLarger";
    document.getElementById("BKSP").className = "kbLarger";
    btns = document.getElementsByClassName("kb");
    btnsLarger = document.getElementsByClassName("kbLarger");
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function () {
            var clicked = this.innerHTML;
            ProcessButtons(clicked);
        });
    }
    for (var i = 0; i < btnsLarger.length; i++) {
        btnsLarger[i].addEventListener("click", function () {
            var clicked = this.innerHTML;
            ProcessButtons(clicked);
        });
    }
}
var guess = "";
var r = 0, c = 0;
function ProcessButtons(k) {
    if (guess.length < 5 && k != "ENTER" && k != "BKSP") {
        guess += k;
        var placeKey = document.getElementById("[" + r + "," + c + "]");
        placeKey.innerHTML = k;
        c++;
    }
    else if (k == "BKSP" && c > 0) {
        c--;
        guess = guess.substring(0, guess.length - 1);
        var placeKey = document.getElementById("[" + r + "," + c + "]");
        placeKey.innerHTML = "";
    }
    else if (k == "ENTER") {
        ProcessGuess(guess);
        r++;
        c = 0;
        guess = "";
    }
}
function ProcessGuess(g) {
    SetColors()
    if (g == word)
        console.log("You won!");
    else
        document.getElementById("row" + r).style.animation = "shake .8s ease-in";

}
function SetColors() {
    var check;
    var count = 0;
    var guessWord = "";
    for (var i = 0; i < word.length; i++) {
        check = document.getElementById("[" + r + "," + i + "]");
        guessWord += check.innerHTML;
    }
    for (var i = 0; i < word.length; i++) {
        check = document.getElementById("[" + r + "," + i + "]");
        keyCheck = document.getElementById(check.innerHTML);
        if (check.innerHTML == word[i]) {
            check.style.backgroundColor = green;
            keyCheck.style.backgroundColor = green;
            count++;
        }
        else if (word.indexOf(check.innerHTML) > -1) {
            check.style.backgroundColor = orange;
            keyCheck.style.backgroundColor = orange;
            count++;
        }
        else {
            check.style.backgroundColor = red;
            keyCheck.style.backgroundColor = red;
        }
    }
}

createTable();
createKeys();