// CrossWordle - Matteo Salverio - Copyright Rat Lab 2023
// https://ratlab.one/crosswordle

var points = 0;
if (localStorage.getItem('crossWordleScores') == null)
    localStorage.setItem('crossWordleScores', [[0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty']]);
else {
    fillBoard();
}

if (localStorage.getItem('crossWordleNewUser') == null)
    localStorage.setItem('crossWordleNewUser', 'true');
if (localStorage.getItem('crossWordleNewUser') == 'true') {
    togglePopup('howToPlay');
    localStorage.setItem('crossWordleNewUser', 'false');
}

function fillBoard() {
    let data = localStorage.getItem('crossWordleScores').split(',');
    let Arr = [];
    let count = 0;
    for (var i = 0; i < data.length; i += 2) {
        Arr[count] = [data[i] * 1, data[i + 1]];
        count++;
    }
    for (var i = 1; i < Arr.length; i++) {
        for (var j = 0; j < i; j++) {
            if (Arr[i][0] > Arr[j][0]) {
                var x = Arr[i][0];
                var y = Arr[i][1];
                Arr[i][0] = Arr[j][0];
                Arr[i][1] = Arr[j][1];
                Arr[j][0] = x;
                Arr[j][1] = y;
            }
        }
    }
    localStorage.setItem('crossWordleScores', Arr);
    for (var i = 1; i <= 5; i++) {
        document.getElementById('player' + i).innerHTML = Arr[i - 1][1];
        document.getElementById('letters' + i).innerHTML = Arr[i - 1][0];
    }
}

var text = [];
function parseData(data) { //Data retrieved at bottom of program
    cSize = data.substring(0, data.indexOf("["));
    data = data.substring(data.indexOf("["), data.length - 1);
    var array2D = [];
    elems = data.split("]-[");
    for (var i = 0; i < elems.length; i++) {
        elems[i] = elems[i].replace("[", "").replace("]", "");
        var pieces = elems[i].split(",");
        array2D.push(pieces);
    }
    text = array2D;
}
var states = [];
var selected = 0;
var tableOpened = false;
var red = "rgb(255, 75, 75)", green = "rgb(108, 255, 89)", orange = "rgb(255, 195, 74)";
//0 is untouched, 1 is unsolved, 1 is letter found, 2 is solved.
for (var i = 0; i < text.length; i++) {
    states[i] = 0;
}
var c = document.getElementById("canvas");
var cSize = 13; //Sets overall grid size
var input = document.getElementById("input");
var grid = new Array(cSize); //1D Array
var wordLocations = [];
var userGrid = new Array(cSize * cSize); //Grid of user input, set up in loadWords()
for (var i = 0; i < cSize * cSize; i++)
    userGrid[i] = " ";
for (var i = 0; i < cSize; i++) {
    grid[i] = new Array(cSize); //2D Array
    for (var j = 0; j < cSize; j++) {
        grid[i][j] = ""; //Empty String
    }
}
function createTable() {
    var toWrite = "";
    toWrite += ("<table border='1px' id='table'>");
    for (var i = 0; i < cSize; i++) {
        toWrite += ("<tr>");
        for (var j = 0; j < cSize; j++) {
            toWrite += ("<th class='space' id='" + i + "," + j + "'> </th>");
        }
        toWrite += ("</tr>");
    }
    toWrite += ("</table>");
    var table = document.getElementById("tableDiv");
    table.innerHTML = toWrite;
    var spaces = document.getElementsByClassName("space");
    for (var i = 0; i < spaces.length; i++) {
        spaces[i].addEventListener("mousedown", event => {
            var s = event.target.id;
            cIndex = s.indexOf(",");
            row = s.substring(0, cIndex);
            column = s.substring(cIndex + 1);
            selectWord(row, column);
        });

        let storedColors = [];
        spaces[i].addEventListener('mouseover', event => {
            var s = event.target.id;
            cIndex = s.indexOf(",");
            row = s.substring(0, cIndex), column = s.substring(cIndex + 1);
            var index = (row * cSize) + (column * 1); //Converts 2D array to 1D array location
            var wordID = (text[index])[0][0]; //The second zero causes the first ID to be used when there's multiple
            if (wordID == 0)
                return
            let letters = wordLocations[wordID];
            for (var j = 0; j < letters.length; j++) {
                let letter2d = convertTo2D(letters[j]);
                let space = document.getElementById(letter2d);
                storedColors.push(space.style.backgroundColor);
                //space.style.backgroundColor = 'rgba(180, 235, 255, 1)';
                space.style.filter = "brightness(90%)";
            }
        });
        spaces[i].addEventListener('mouseout', event => {
            var s = event.target.id;
            cIndex = s.indexOf(",");
            row = s.substring(0, cIndex), column = s.substring(cIndex + 1);
            var index = (row * cSize) + (column * 1); //Converts 2D array to 1D array location
            var wordID = (text[index])[0][0]; //The second zero causes the first ID to be used when there's multiple
            let letters = wordLocations[wordID];
            for (var j = 0; j < letters.length; j++) {
                let letter2d = convertTo2D(letters[j]);
                let space = document.getElementById(letter2d);
                space.style.backgroundColor = storedColors[j];
                space.style.filter = "";
            }
            resetColors();
        });
    }
}
function loadPuzzle() {
    var x = 0;
    for (var i = 0; i < cSize; i++) {
        for (var j = 0; j < cSize; j++) {
            var space = document.getElementById(i + "," + j);
            grid[i][j] = text[x][1];
            if (text[x][1] != ".") {
                space.style.backgroundColor = "aliceblue";
            }
            x++;
        }
    }
}
var words = [];
function loadWords() {
    var tempID = 0;
    while (true) {
        wordLocations.push([]);
        var found = false;
        var word = "";
        for (var i = 0; i < text.length; i++) {
            if (text[i][0].indexOf(tempID) > -1) {
                found = true;
                word += text[i][1];
                wordLocations[tempID].push(i);
            }
        }
        if (!found) {
            break;
        }
        words.push([tempID, word]);
        tempID++;
    }
}
function selectWord(row, column) {
    resetColors();
    //The "column * 1" is to ensure that index is an integer, not a string
    var index = (row * cSize) + (column * 1); //Converts 2D array to 1D array location
    var wordID = (text[index])[0][0]; //The second zero causes the first ID to be used when there's multiple
    selected = wordID;
    if (wordleGuesses[selected].length >= words[selected][1].length - 1 ||
        wordleGuesses[selected][wordleGuesses[selected].length - 1] == words[selected][1]) {
        return;
    }
    if (wordID == 0) {
        return;
    }
    showWordleTable(wordID);
}
function selectWordById(wordID) {
    selected = wordID;
    if (wordleGuesses[selected].length >= words[selected][1].length - 1 ||
        wordleGuesses[selected][wordleGuesses[selected].length - 1] == words[selected][1]) {
        return;
    }
    if (wordID == 0) {
        return;
    }
    showWordleTable(wordID);
}
function wordHover(row, column) {
    var index = (row * cSize) + (column * 1); //Converts 2D array to 1D array location
    var wordID = (text[index])[0][0]; //The second zero causes the first ID to be used when there's multiple
}
function resetColors() {
    for (var i = 0; i < text.length; i++) {
        var s = document.getElementById(convertTo2D(i));
        if (text[i][0] != "0" && states[i] == 0) {
            s.style.backgroundColor = "white"; //Deselect all
        }
        else if (states[i] == 1 && text[i][1] != ".") {
            s.style.backgroundColor = red;
        }
        else if (states[i] == 2) {
            s.style.backgroundColor = orange;
        }
        else if (states[i] == 3) {
            s.style.backgroundColor = green;
        }
    }
}
function convertTo2D(index) {
    var count = 0;
    for (var i = 0; i < cSize; i++) {
        for (var j = 0; j < cSize; j++) {
            if (count == index) {
                return i + "," + j;
            }
            count++;
        }
    }
}
function convertTo1D(row, column) {
    //The "column * 1" is to ensure that index is an integer, not a string
    return (row * cSize) + (column * 1);
}
function guessWord(word) {
    if (word == null)
        return;
    for (var i = 0; i < word.length; i++) { //Ensures word is displayed with spaces,
        if (word.length < words[selected][1].length) //Not "undefined" spaces
            word += " ";
    }
    var wordIndex = 0;
    for (var i = 0; i < cSize; i++) {
        for (var j = 0; j < cSize; j++) {
            var space = document.getElementById(i + "," + j);
            var spaceID = text[convertTo1D(i, j)][0];
            var spaceText = text[convertTo1D(i, j)][1];
            if (spaceID.indexOf(selected) > -1) {
                var letter = word[wordIndex];
                if (spaceText == letter) { //If the letter is in the correct place
                    states[convertTo1D(i, j)] = 3; //Set the state of that space to Correct
                    space.style.backgroundColor = green;
                    space.innerHTML = grid[i][j]; //Display the letter
                }
                else if (words[selected][1].indexOf(letter) > -1) { //If the letter is in the word
                    states[convertTo1D(i, j)] = 2; //Set the state of the space to found
                    space.style.backgroundColor = orange;
                    space.innerHTML = word[wordIndex]; //Display the input letter
                }
                else { //If the letter is incorrect
                    states[convertTo1D(i, j)] = 1; //Set the state of the space to incorrect
                    space.style.backgroundColor = red;
                    space.innerHTML = word[wordIndex]; //Display the letter
                }
                userGrid[convertTo1D(i, j)] = word[wordIndex];
                wordIndex++;
            }
        }
    }
    c = 0;
}

//localStorage.setItem('crossWordleScores', [[0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty']]);
function finish() {
    points *= 1;
    let data = localStorage.getItem('crossWordleScores').split(',');
    console.log(data);
    let Arr = [];
    let count = 0;
    for (var i = 0; i < data.length; i += 2) {
        Arr[count] = [data[i] * 1, data[i + 1]];
        count++;
    }

    if (points > Arr[Arr.length - 1][0])
        Arr.push([points, prompt("Congratulations! You made the leaderboard!\nWhat is your name?")]);

    for (var i = 1; i < Arr.length; i++) {
        for (var j = 0; j < i; j++) {
            if (Arr[i][0] > Arr[j][0]) {
                var x = Arr[i][0];
                var y = Arr[i][1];
                Arr[i][0] = Arr[j][0];
                Arr[i][1] = Arr[j][1];
                Arr[j][0] = x;
                Arr[j][1] = y;
            }
        }
    }
    localStorage.setItem('crossWordleScores', Arr);
    for (var i = 1; i <= 5; i++) {
        document.getElementById('player' + i).innerHTML = Arr[i - 1][1];
        document.getElementById('letters' + i).innerHTML = Arr[i - 1][0];
    }
    togglePopup('leaderboards');
}

//WORDLE: THIS IS WHERE WORDLE IS IMPLEMENTED
var wordleTries = [];
var wordleGuesses = [];
function wordleSetup() {
    for (var i = 0; i < words.length; i++) {
        wordleTries.push(words[i][1].length + 1);
        wordleGuesses[i] = [];
    }
}
var word = "";
var wordLetters = [
    ['A', 0], ['B', 0], ['C', 0], ['D', 0], ['E', 0], ['F', 0],
    ['G', 0], ['H', 0], ['I', 0], ['J', 0], ['K', 0], ['L', 0],
    ['M', 0], ['N', 0], ['O', 0], ['P', 0], ['Q', 0], ['R', 0],
    ['S', 0], ['T', 0], ['U', 0], ['V', 0], ['W', 0], ['X', 0],
    ['Y', 0], ['Z', 0]
];
var wordleCSize = 0;
var wordleTab = document.getElementById("wordleTab");
var crossword = document.getElementById("canvas");
function showWordleTable() {
    word = words[selected][1];
    for (var i = 0; i < word.length; i++) {
        for (var j = 0; j < wordLetters.length; j++) {
            if (word[i] == wordLetters[j][0])
                wordLetters[j][1]++;
        }
    }
    let tries = word.length + 1;
    if (tries < 6)
        tries = 6;
    wordleCSize = word.length;
    crossword.hidden = true;
    wordleTab.hidden = false;
    tableOpened = true;
    var wordleTable = document.getElementById("wordleTable");
    wordleTable.innerHTML = "";
    var toWrite = "";
    toWrite += "<table class='topTable' border='1px'><tr>"
    for (var i = 0; i < word.length; i++) {
        toWrite += "<th class='topSpace' id='top" + i + "'>";
    }
    toWrite += "</tr></table>";
    toWrite += "<table class='wordleTable' border='1px' id='table'>";
    for (var i = 0; i < tries; i++) {
        toWrite += ("<tr id='row" + i + "'>");
        for (var j = 0; j < wordleCSize; j++) {
            toWrite += ("<th class='wordleSpace' id='[" + i + "," + j + "]'> </th>");
        }
        toWrite += ("</tr>");
    }
    toWrite += "</table><br><br>";
    toWrite += "<div id='keysDiv'></div>"
    toWrite += "<br><br>";
    toWrite += "<button style='width: 150px; height: 50px; font-size: 24px' onclick='closeWordButton()'>Close Word</button><br><br>"
    toWrite += '<div class="popup alert" id="notWordAlert" style="display: none;"><h2 style="margin-top: 12px; color: aliceblue;">Not a word!</h2></div>';
    wordleTable.innerHTML += toWrite;
    createKeys();
    r = 0;
    c = 0;
    for (var i = 0; i < wordleGuesses[selected].length; i++) {
        for (var j = 0; j < wordleGuesses[selected][i].length; j++) {
            ProcessButtons(wordleGuesses[selected][i][j]);
        }
        SetColors();
        r++;
        c = 0;
        guess = "";
    }
    guess = "";
    for (var i = 0; i < word.length; i++) {
        var letterFromGrid = userGrid[wordLocations[selected][i]]; //Gets letters from other words
        var topElem = document.getElementById("top" + i); //Top row of spaces
        if (letterFromGrid == word[i]) { //These set the space
            topElem.style.backgroundColor = green;
            topElem.innerHTML = letterFromGrid;
        }
    }
    document.getElementById('menu').style.display = 'none';
}
function closeWordleTable() {
    wordleTab.hidden = true;
    crossword.hidden = false;
    tableOpened = false;
    document.getElementById('menu').style.display = 'inline';
}
function createKeys() {
    var alphabet = "QWERTYUIOPASDFGHJKL4ZXCVBNM3" //Key set
    var aCount = 0
    var toWrite = ""
    var w = 10;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < w; j++) {
            var key = alphabet[aCount]
            if (key == "3")
                key = "ENTER"
            else if (key == "4")
                key = "BKSP"
            toWrite += "<button id='" + key + "' class='kb'>" + key + "</button>"
            aCount++
        }
        toWrite += "<br>"
        w--
        if (w == 8)
            w++
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
var possibleKeys = [ //These are all keys that can be input from the keyboard, all others are ignored.
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'ENTER', 'BKSP'
];
document.addEventListener('keydown', (event) => {
    var name = event.key.toUpperCase();
    if (tableOpened) {
        if (name == "BACKSPACE")
            name = "BKSP";
        if (possibleKeys.indexOf(name) > -1)
            ProcessButtons(name);
    }
}, false);
var guess = ""
var r = 0, c = 0;
function ProcessButtons(k) {
    if (guess.length < word.length && k != "ENTER" && k != "BKSP") {
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
        document.getElementById('notWordAlert').style.display = 'none';
    }
    else if (k == "ENTER") {
        if (guess.length < word.length)
            return;
        check_if_word_exists(guess);
    }
}
function check_if_word_exists(wordToCheck) { //Spellcheck
    wordToCheck = wordToCheck.toLowerCase();
    const url = "https://api.wordnik.com/v4/word.json/" + wordToCheck + "/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";

    $.ajax({
        type: "GET",
        url: url
    }).done(function () { //If word exists
        ProcessGuess(guess);
        r++;
        c = 0;
        guess = "";
    }).fail(function () { //If word does not exist
        //document.getElementById("row" + wordleGuesses[selected].length).style.animation = "shake .8s ease-in";
        togglePopup('notWordAlert');
    });
}
function ProcessGuess(g) {
    if (wordleTries[selected] < 0)
        return;
    if (g == word) {
        wordGuessedCorrect();
    }
    else {
        document.getElementById("row" + wordleGuesses[selected].length).style.animation = "shake .8s ease-in";
    }
    SetColors();
    wordleTries[selected]--; //Subtract 1 from tries
    wordleGuesses[selected].push(guess);
}
function SetColors() {
    var check;
    var count = 0;
    var guessWord = "";
    guessLetters = [
        ['A', 0], ['B', 0], ['C', 0], ['D', 0], ['E', 0], ['F', 0],
        ['G', 0], ['H', 0], ['I', 0], ['J', 0], ['K', 0], ['L', 0],
        ['M', 0], ['N', 0], ['O', 0], ['P', 0], ['Q', 0], ['R', 0],
        ['S', 0], ['T', 0], ['U', 0], ['V', 0], ['W', 0], ['X', 0],
        ['Y', 0], ['Z', 0]
    ];

    var doAfter = [];
    for (var i = 0; i < word.length; i++) {
        check = document.getElementById("[" + r + "," + i + "]");
        var keyCheck = document.getElementById(check.innerHTML);
        if (check.innerHTML == word[i]) {
            check.style = "background-color: " + green;
            keyCheck.style = "background-color: " + green + "; height: 60px; width: 45px;";
            count++;
            for (var j = 0; j < guessLetters.length; j++) {
                if (guessLetters[j][0] == check.innerHTML) {
                    guessLetters[j][1]++;
                    break;
                }
            }
        }
        else if (word.indexOf(check.innerHTML) > -1) {
            doAfter.push(check); //These are done after to give priority to correct letters, go to line 390
        }
        else {
            check.style = "background-color: " + red;
            keyCheck.style = "background-color: " + red + "; height: 60px; width: 45px;";
        }
    }

    for (var checks = 0; checks < doAfter.length; checks++) {
        check = doAfter[checks];
        for (var j = 0; j < guessLetters.length; j++) {
            if (guessLetters[j][0] == check.innerHTML) {
                guessLetters[j][1]++;
                if (guessLetters[j][1] <= wordLetters[j][1]) {
                    check.style = "background-color:  " + orange;
                    if (keyCheck.style.backgroundColor != green)
                        keyCheck.style = "background-color: " + orange + "; height: 60px; width: 45px;";
                    count++;
                }
                else {
                    check.style = "background-color: " + red;
                    if (keyCheck.style.backgroundColor != green && keyCheck.style.backgroundColor != orange)
                        keyCheck.style = "background-color: " + red + "; height: 60px; width: 45px;";
                }
            }
        }
    }
}
function wordGuessedCorrect() {
    closeWordleTable();
    guessWord(guess); //Guesses the word on the main crossword
    points++;
    document.getElementById('score').innerHTML = "Score: " + points;
}
function closeWordButton() {
    closeWordleTable();
    gu = wordleGuesses[selected][wordleGuesses[selected].length - 1];
    if (gu != null)
        guessWord(gu);
}
//END OF REGULAR WORDLE IMPLEMENTATION

function resetLeaderboard() { //Deletes all leaderboard entries
    localStorage.setItem('crossWordleScores', [[0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty']]);
    fillBoard();
}

//words[]: [wordID, word]
function autocomplete() { //Automatically completes the CrossWordle puzzle
    for (var i = 1; i < words.length; i++) {
        selectWordById(i);
        guessWord(words[i][1]);
        closeWordleTable();
    }
}

function loadNewPuzzle(d) {
    parseData(d);
    createTable();
    loadPuzzle();
    loadWords();
    wordleSetup();
}

function offlineStart() { //For if the site is local (offline)
    let offlinePuzzles = [
        '12[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[1-2,J]-[1,A]-[1,C]-[1,K]-[1,E]-[1,T]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,E]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[3,F]-[3,L]-[2-3,A]-[3,N]-[3,N]-[3,E]-[3,L]-[0,.]-[7,P]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,N]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[7,A]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2-4,S]-[4,H]-[4,O]-[4,E]-[4-5,S]-[0,.]-[7,N]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[5-6,H]-[6,A]-[6-7,T]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[5,I]-[0,.]-[7,S]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[5,R]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[5,T]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]',
        '12[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,M]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,O]-[0,.]-[0,.]-[0,.]-[0,.]-[4,W]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[1-2,B]-[1,U]-[1,S]-[1-3,I]-[1,N]-[1-4,E]-[1,S]-[1,S]-[0,.]-[0,.]-[0,.]-[0,.]-[2,I]-[0,.]-[0,.]-[3,N]-[0,.]-[4,B]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,L]-[0,.]-[0,.]-[3-5,T]-[5,E]-[4-5,S]-[5,T]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,E]-[0,.]-[0,.]-[3,R]-[0,.]-[4,I]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[3,O]-[0,.]-[4,T]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[4,E]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]',
        '12[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,C]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[1,P]-[1,R]-[1-2,O]-[1,G]-[1-3,R]-[1,A]-[1,M]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,N]-[0,.]-[3,A]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,S]-[0,.]-[3,N]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[4,D]-[4,A]-[2-4,T]-[4,E]-[3-4,D]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,A]-[0,.]-[3,O]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2-5,N]-[5,A]-[3-5,M]-[5,E]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[2,T]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]-[0,.]'
    ];
    let offlinePuzzleId = Math.floor(Math.random() * offlinePuzzles.length);
    parseData(offlinePuzzles[offlinePuzzleId]);
    createTable();
    loadPuzzle();
    loadWords();
    wordleSetup();
}
var amountOfPuzzles = 3;
var puzzleId = Math.floor(Math.random() * amountOfPuzzles) + 1;
//puzzleId = 3;
function onlineStart() { //For if the site is on a server (or VSCode Live Server)
    fetch('puzzles/' + puzzleId + '.txt')
        .then(response => response.text())
        .then(data => {
            parseData(data);
            createTable();
            loadPuzzle();
            loadWords();
            wordleSetup();
        })
        .catch(err => {
            console.clear();
            console.error("Error: Cannot Access Online Puzzles");
            alert("NOTICE: CrossWordle is meant to be run on an online website. CrossWordle will now run in offline mode")
            offlineStart();
        });
}

//Start of Program:
onlineStart();

function togglePopup(popupName) {
    let popup = document.getElementById(popupName);
    if (popup.style.display == 'none')
        popup.style.display = 'inline';
    else
        popup.style.display = 'none';
}

function displayAlert(name) {
    let popup = document.getElementById(name);
    popup.style.display = 'inline';
}