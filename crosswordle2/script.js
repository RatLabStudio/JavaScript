const mainTable = document.getElementById("mainTable"); // Grid of letter spaces
const wordle = document.getElementById("wordle"); // Wordle Panel
const wordleTable = document.getElementById("wordleTable"); // Wordle table letter spaces
const menu = document.getElementById("menu"); // Buttons at the bottom
const keyboard = document.getElementById("keyboard"); // On-screen keyboard
const hintDisplay = document.getElementById("hint"); // Hint provided in the wordle panel
const scoreDisplay = document.getElementById("score"); // Score display at the top left
const red = "rgb(255, 75, 75)", green = "rgb(108, 255, 89)", orange = "rgb(255, 195, 74)"; // Color presets
var activeWordle = false; // Whether the player is working on a word
var dataList = ""; // All save/game data

const puzzleFile = document.getElementById("puzzleFile");

var settings = {
    spellcheck: true,
    hints: true,
    colorful: false,
    demo: "false"
}

// Local Storage Data Management:
function resetData() { // Resets all localstorage data to default
    localStorage.setItem('crossWordleScores', [[0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty']]);
    localStorage.setItem('crossWordleNewUser', 'true');
    location.reload();
}

if (localStorage.getItem('crossWordleScores') == null) // Leaderboards scores
    localStorage.setItem('crossWordleScores', [[0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty'], [0, 'Empty']]);
else {
    fillBoard();
}

if (localStorage.getItem('crossWordleDemoMode') == null) // Demo mode for presentation
    localStorage.setItem('crossWordleDemoMode', "false");
else {
    settings.demo = localStorage.getItem('crossWordleDemoMode');
    if (settings.demo == true || settings.demo == "true")
        console.log("Demo mode active");
}

if (localStorage.getItem('crossWordleNewUser') == null) // Whether the player has played before
    localStorage.setItem('crossWordleNewUser', 'true');
togglePopup('howToPlay');

// Main game logic:
function fillBoard() { // Populates leaderboard with player scores
    let scores = localStorage.getItem("crossWordleScores").split(",");
    let scoresArr = [], tempArr = [];
    for (let i = 0; i < scores.length; i++) {
        tempArr.push(scores[i]);
        if ((i + 1) % 2 == 0) {
            scoresArr.push(tempArr);
            tempArr = [];
        }
    }
    scoresArr.sort((a, b) => b[0] - a[0]);
    for (let i = 0; i < 5; i++) {
        document.getElementById("player" + (i + 1)).innerHTML = scoresArr[i][1];
        document.getElementById("letters" + (i + 1)).innerHTML = scoresArr[i][0];
    }
}

function instantiateTable(size) { // Creates the main grid
    for (let i = 0; i < size; i++) {
        mainTable.innerHTML += "<tr id='mainTableRow" + i + "'></tr>"
        for (let j = 0; j < size; j++) {
            document.getElementById("mainTableRow" + i).innerHTML += "<td id='" + i + "," + j + "'> </td>"
        }
        mainTable.innerHTML += "<br>"
    }
}

function instantiateKeyboard() { // Creates the on-screen keyboard
    keyboard.innerHTML = "";
    let keys = "QWERTYUIOPASDFGHJKL1ZXCVBNM2";
    let index = 0;
    let lengths = [10, 9, 9];
    for (let i = 0; i < lengths.length; i++) {
        for (let j = 0; j < lengths[i]; j++) {
            let keyText = keys[index];
            let className = "key";
            if (keys[index] == 1) {
                keyText = "BKSP";
                className += " specialKey";
            }
            else if (keys[index] == 2) {
                keyText = "ENTER";
                className += " specialKey";
            }
            keyboard.innerHTML += "<button id='key" + keyText + "' class='" + className + "'>" + keyText + "</button>";
            index++;
        }
        keyboard.innerHTML += "<br>";
    }
    let keyButtons = document.getElementsByClassName("key");
    for (let i = 0; i < keyButtons.length; i++) {
        keyButtons[i].addEventListener("mousedown", event => {
            let k = event.target.id.replace("key", "");
            if (k == "BKSP")
                k = "BACKSPACE";
            processInput(k);
        });
    }
}
function resetKeyboard() { // Removes word-specific styling from the keyboard
    let keyButtons = document.getElementsByClassName("key");
    for (let i = 0; i < keyButtons.length; i++) {
        keyButtons[i].style.backgroundColor = "lightgray";
    }
}

function getPos(id, index) { // Returns position of a letter given it's wordId and index within the word
    let initialPos = dataList.words[id].location.split(",");
    let pos = initialPos;
    if (dataList.words[id].direction == "horizontal")
        pos[1] = initialPos[1] * 1 + index * 1;
    else
        pos[0] = initialPos[0] * 1 + index * 1;
    return pos;
}

function fillTable() { // Populate the main grid with words
    for (let i = 0; i < dataList.words.length; i++) {
        for (let j = 0; j < dataList.words[i].word.length; j++) {
            let space = document.getElementById(getPos(i, j)[0] + "," + getPos(i, j)[1]);
            //space.innerHTML = dataList.words[i].word[j]; // Shows all answers if uncommented
            space.className += " " + dataList.words[i].id + " ";
            if (space.className.indexOf("blankTile") < 0)
                space.className += " blankTile ";
            space.addEventListener("mouseover", event => {
                let spaceClasses = event.target.classList;
                let k = 0;
                while (spaceClasses[k] * 1 == NaN)
                    k++
                highlightWord(spaceClasses[0]);
                updateColors();
            });
            space.addEventListener("mouseout", event => {
                let spaceClasses = event.target.classList;
                let k = 0;
                while (spaceClasses[k] * 1 == NaN)
                    k++
                unhighlightWord(spaceClasses[0]);
                updateColors();
            });
            space.addEventListener("click", event => {
                let spaceClasses = event.target.classList;
                let k = 0;
                while (spaceClasses[k] * 1 == NaN)
                    k++
                selectWord(spaceClasses[0]);
                updateColors();
            });
        }
    }
}

function getWordSpaces(id) { // Returns locations of all letters within a given word
    let arr = []
    for (let i = 0; i < dataList.words[id].word.length; i++) {
        arr.push(document.getElementById(getPos(id, i)[0] + "," + getPos(id, i)[1]));
    }
    return arr;
}

function highlightWord(id) {
    let wordSpaces = getWordSpaces(id);
    for (let i = 0; i < wordSpaces.length; i++) {
        wordSpaces[i].style.filter = "brightness(130%)";
    }
}

function unhighlightWord(id) {
    let wordSpaces = getWordSpaces(id);
    for (let i = 0; i < wordSpaces.length; i++)
        wordSpaces[i].style.filter = "brightness(100%)";
}

var pointsValue = 0, done = false;
function updateColors() { // Update the color of every letter tile
    // Uses the array of attempts
    let o = 0.6, c = 0, d = true;
    let wordColors = [
        "rgba(155, 35, 53, " + o + ")",
        "rgba(221, 65, 36, " + o + ")",
        "rgba(239, 192, 80, " + o + ")",
        "rgba(136, 176, 75, " + o + ")",
        "rgba(146, 168, 209, " + o + ")",
        "rgba(181, 101, 167, " + o + ")",
        "rgba(214, 80, 118, " + o + ")",
        "rgba(91, 94, 166, " + o + ")",
        "rgba(85, 180, 176, " + o + ")",
        "rgba(0, 155, 119, " + o + ")"
    ];
    for (let i = 0; i < dataList.words.length; i++) { // For each word in the puzzle file
        if (dataList.words[i].attempts.length <= 0) { // Ensures that the word has been attempted
            if (settings.colorful) {
                for (let j = 0; j < dataList.words[i].word.length; j++) {
                    let s = document.getElementById(getPos(i, j)[0] + "," + getPos(i, j)[1]);
                    if (s.style.backgroundColor != "") {
                        if (s.style.backgroundColor == red || s.style.backgroundColor == green || s.style.backgroundColor == orange)
                            continue;
                        else
                            s.style.backgroundColor = getColorBetween(wordColors[c], s.style.backgroundColor); // Makes the intersection points a mixture of the two colors
                    }
                    else
                        s.style.backgroundColor = wordColors[c];
                }
                if (c >= wordColors.length - 1)
                    d = false;
                else if (c <= 0)
                    d = true;
                if (d)
                    c++;
                else
                    c--;
            }
            else {
                for (let j = 0; j < dataList.words[i].word.length; j++)
                    document.getElementById(getPos(i, j)[0] + "," + getPos(i, j)[1]).style.backgroundColor = "rgb(185, 185, 185)";
            }
            continue;
        }
        let colors = checkGuess(i, dataList.words[i].attempts[dataList.words[i].attempts.length - 1]);
        for (let j = 0; j < dataList.words[i].word.length; j++)
            document.getElementById(getPos(i, j)[0] + "," + getPos(i, j)[1]).style.backgroundColor = colors[j];
    }

    let points = 0;
    for (let i = 0; i < dataList.words.length; i++) {
        if (dataList.words[i].attempts.length <= 0)
            continue;
        let word = "";
        for (let j = 0; j < dataList.words[i].word.length; j++) {
            word += document.getElementById(getPos(dataList.words[i].id, j)[0] + "," + getPos(dataList.words[i].id, j)[1]).innerHTML;
        }
        let colors = checkGuess(dataList.words[i].id, word);
        for (let j = 0; j < dataList.words[i].word.length; j++) {
            document.getElementById(getPos(dataList.words[i].id, j)[0] + "," + getPos(dataList.words[i].id, j)[1]).style.backgroundColor = colors[j];
        }
        for (let j = 0; j < colors.length; j++) {
            if (colors[j] == green) {
                points += 5;
                if (!settings.spellcheck)
                    points -= 1;
                if (!settings.hints)
                    points += 1;
            }
            else if (colors[j] == orange)
                points += 1;
        }
    }
    pointsValue = points;
    setPoints(points);

    let finished = true;
    for (let i = 0; i < dataList.words.length; i++) {
        if (dataList.words[i].word != dataList.words[i].attempts[dataList.words[i].attempts.length - 1] &&
            dataList.words[i].attempts.length != dataList.words[i].length + 1)
            finished = false;
    }
    if (finished && !done) {
        done = true;
        finishGame();
    }
}

async function setPoints(points) { // Adds points to the score display
    let oldPoints = scoreDisplay.innerHTML.replace("Score: ", "") * 1;
    while (pointsValue > oldPoints) {
        oldPoints++;
        scoreDisplay.innerHTML = "Score: " + oldPoints;
        await new Promise((resolve) => setTimeout(resolve, 25));
    }
    scoreDisplay.innerHTML = "Score: " + points;
}

function getColorBetween(color1, color2) { // Takes two RGB or RGBA colors and returns the color between them
    let c1 = color1.replace("rgba", "").replace("rgb", "").replace("(", "").replace(")", "").replace(" ", "").split(",");
    let c2 = color2.replace("rgba", "").replace("rgb", "").replace("(", "").replace(")", "").replace(" ", "").split(",");
    let between = [
        Math.round((c1[0] * 1 + c2[0] * 1) / 2),
        Math.round((c1[1] * 1 + c2[1] * 1) / 2),
        Math.round((c1[2] * 1 + c2[2] * 1) / 2),
        (c1[3] * 1 + c1[3] * 1) / 2
    ];
    return "rgba(" + between[0] + "," + between[1] + "," + between[2] + "," + between[3] + ")";
}

// Returns an array of colors for a guess on a given word
function checkGuess(wordId, guess) {
    let arr = []; // Array of colors
    let word = dataList.words[wordId].word; // Current word
    let letters = []; // Count of each letter in the word
    let lettersFound = []; // Cound of how many of each letter the guess contains

    // Fill the arrays from 65 (the ascii value for 'a') to 90 (the ascii value for 'z')
    for (let i = 65; i <= 90; i++) {
        letters[i] = 0; // Set the count to zero
        lettersFound[i] = 0;
    }

    // Count each letter in the word
    for (let i = 0; i < word.length; i++)
        letters[word[i].charCodeAt()]++;

    // Correct letters are prioritized
    for (let i = 0; i < word.length; i++) { // For each letter in the word
        if (guess[i] == word[i]) { // If letters match
            lettersFound[guess[i].charCodeAt()]++; // Add one to the count of that letter
            arr[i] = green; // The letter is correct
        }
    }

    for (let i = 0; i < word.length; i++) { // Count all other letters after
        if (guess[i] == word[i]) // If letters match,
            continue; // Skip this time because they were already checked

        else if (word.indexOf(guess[i]) > -1) { // If the letter is in the word
            lettersFound[guess[i].charCodeAt()]++; // Add one to the count of that letter

            // If the amount of the letter is greater in the guess than in the word:
            if (lettersFound[guess[i].charCodeAt()] > letters[guess[i].charCodeAt()])
                arr[i] = (red); // The letter is incorrect

            else
                arr[i] = (orange); // The letter is in the word somewhere
        }

        else // If the letter is not in the word
            arr[i] = (red); // The letter is incorrect
    }

    return arr; // Return the array of colors to be used when displaying the guess
}

var selectedWordId = null;
var column = 0;

function selectWord(id) { // Selects a word from it's ID
    if (dataList.words[id].word == dataList.words[id].attempts[dataList.words[id].attempts.length - 1])
        return;
    selectedWordId = id;
    showWordleTable(id);
    column = 0;
}

function showWordleTable(wordId) { // Displays the Wordle panel of a given word
    activeWordle = true;
    mainTable.style.display = "none";
    wordle.style.display = "inline";
    menu.style.display = "none";

    resetKeyboard();

    let hint = dataList.words[wordId].hint;
    if (hint != undefined && hint != "undefined" && hint != null && hint != "" && settings.hints)
        hintDisplay.innerHTML = hint;
    else if (!settings.hints)
        hintDisplay.innerHTML = "Hints are disabled.";
    else
        hintDisplay.innerHTML = "No hint provided.";

    wordleTable.innerHTML = "";
    for (let i = 0; i < dataList.words[wordId].word.length + 1; i++) {
        wordleTable.innerHTML += "<tr id='wordleTableRow" + i + "'></tr>"
        for (let j = 0; j < dataList.words[wordId].word.length; j++) {
            document.getElementById("wordleTableRow" + i).innerHTML += "<td id='wordleTable[" + i + "," + j + "]' class='wordleTableSpace'></td";
        }
    }

    let topRow = document.getElementById("wordleTopRow");
    topRow.innerHTML = "";
    for (let i = 0; i < dataList.words[wordId].word.length; i++) {
        topRow.innerHTML += "<td id='topRow" + i + "'></td>"
        let currentSpace = document.getElementById(getPos(wordId, i)[0] + "," + getPos(wordId, i)[1]);
        if (currentSpace.innerHTML == dataList.words[selectedWordId].word[i]) {
            document.getElementById("topRow" + i).innerHTML = currentSpace.innerHTML;
            document.getElementById("topRow" + i).style.backgroundColor = green;
        }
        else
            document.getElementById("topRow" + i).innerHTML = " ";
    }

    let tempAttempts = dataList.words[selectedWordId].attempts;
    dataList.words[selectedWordId].attempts = [];
    for (let i = 0; i < tempAttempts.length; i++) {
        for (let j = 0; j < tempAttempts[i].length; j++) {
            document.getElementById("wordleTable[" + i + "," + j + "]").innerHTML = tempAttempts[i][j];
        }
        wordleGuess(tempAttempts[i]);
        dataList.words[selectedWordId].attempts.push(tempAttempts[i]);
    }
}

function closeWordleTable() { // Closes whatever Wordle panel is open
    activeWordle = false;
    mainTable.style.display = "inline";
    wordle.style.display = "none";
    menu.style.display = "inline";

    if (dataList.words[selectedWordId].attempts.length > 0) {
        for (let i = 0; i < dataList.words[selectedWordId].word.length; i++) {
            let space = document.getElementById(getPos(selectedWordId, i)[0] + "," + getPos(selectedWordId, i)[1]);
            let wordleSpace = document.getElementById("wordleTable[" + (dataList.words[selectedWordId].attempts.length - 1) + "," + i + "]");
            space.innerHTML = wordleSpace.innerHTML
        }
    }

    updateColors();
}

const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "ENTER", "BACKSPACE"];
document.addEventListener("keydown", function (e) {
    if (!activeWordle) {
        if (e.key == "Escape") {
            if (confirm("Are you sure you want to finish?"))
                finishGame();
        }
        return;
    }
    let k = e.key.toUpperCase();
    if (k == "ESCAPE") {
        closeWordleTable();
        return;
    }
    if (keys.indexOf(k) < 0)
        return;

    if (dataList.words[selectedWordId].attempts.length >= dataList.words[selectedWordId].word.length + 1)
        return;

    processInput(k);
});

function processInput(k) { // Sends key input or button input the the game
    if (dataList.words[selectedWordId].word == dataList.words[selectedWordId].attempts[dataList.words[selectedWordId].attempts.length - 1])
        return;
    if (k == "BACKSPACE") {
        if (column <= 0)
            return;
        column--;
        document.getElementById("wordleTable[" + dataList.words[selectedWordId].attempts.length + "," + column + "]").innerHTML = "";
        document.getElementById('notWordAlert').style.display = 'none';
        return;
    }
    else if (k == "ENTER") {
        wordleEnter();
        return;
    }

    if (column >= dataList.words[selectedWordId].word.length)
        return;
    document.getElementById("wordleTable[" + dataList.words[selectedWordId].attempts.length + "," + column + "]").innerHTML = k;
    column++;
}

function spellCheck(string) {
    return fetch('words.txt')
        .then(response => response.text())
        .then(data => {
            const wordList = data.split('\n');
            const sanitizedLine = string.trim().toLowerCase();
            let result1 = wordList.includes(sanitizedLine + "\r");
            let result2 = wordList.includes(sanitizedLine);
            if (result1 || result2)
                return true;
            return false;
        })
        .catch(error => {
            console.error('Error:', error);
            return false; // Return false in case of an error
        });
}

async function animateRow() {
    for (let i = 0; i < dataList.words[selectedWordId].word.length; i++) {
        document.getElementById("wordleTable[" + (dataList.words[selectedWordId].attempts.length - 1) + "," + i + "]").style.animation = "flip 400ms ease forwards";
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
}

function wordleEnter() {
    let guess = "";
    for (let i = 0; i < dataList.words[selectedWordId].word.length; i++) {
        let space = document.getElementById("wordleTable[" + dataList.words[selectedWordId].attempts.length + "," + i + "]");
        guess += space.innerHTML;
    }
    if (guess.length < dataList.words[selectedWordId].word.length)
        return;

    if (settings.spellcheck) {
        spellCheck(guess.toLowerCase())
            .then(result => {
                if (!result) {
                    togglePopup("notWordAlert");
                    return;
                }
                else {
                    column = 0;
                    wordleGuess(guess);
                    dataList.words[selectedWordId].attempts.push(guess);
                    if (guess == dataList.words[selectedWordId].word || dataList.words[selectedWordId].attempts.length >= dataList.words[selectedWordId].word.length + 1) {
                        animateRow();
                        //closeWordleTable();
                    }
                }
            });
    }
    else {
        column = 0;
        wordleGuess(guess);
        dataList.words[selectedWordId].attempts.push(guess);
        if (guess == dataList.words[selectedWordId].word || dataList.words[selectedWordId].attempts.length >= dataList.words[selectedWordId].word.length + 1) {
            animateRow();
            //closeWordleTable();
        }
    }
}

function wordleGuess(guess) {
    if (guess != dataList.words[selectedWordId].word)
        document.getElementById("wordleTableRow" + dataList.words[selectedWordId].attempts.length).style.animation = "shake .8s ease-in";
    let colors = checkGuess(selectedWordId, guess);
    for (let i = 0; i < dataList.words[selectedWordId].word.length; i++) {
        let space = document.getElementById("wordleTable[" + dataList.words[selectedWordId].attempts.length + "," + i + "]");
        space.style.backgroundColor = colors[i];
        document.getElementById("key" + space.innerHTML).style.backgroundColor = colors[i];
    }
}

function enterString(string) {
    for (let i = 0; i < string.length; i++)
        processInput(string[i].toUpperCase());
    processInput("ENTER");
}

const puzzles = ["clothing", "recreation", "FBLA", /*"extreme",*/ "generated"];
var puzzleName = puzzles[Math.floor(Math.random() * puzzles.length)];
if (settings.demo == "true")
    puzzleName = "FBLA";
//const puzzleName = "word";
function onlineStart() { // For if the site is on a server (or VSCode Live Server)
    fetch('puzzles/' + puzzleName + '.json')
        .then(response => response.text())
        .then(data => {
            dataList = JSON.parse(data);
            loadNewPuzzle();
        })
        .catch(err => {
            // console.error(err)
            console.clear();
            console.error("Error: Cannot Access Online Puzzles");
            alert("NOTICE: CrossWordle is meant to be run on an online website. CrossWordle will now run in offline mode")
            offlineStart();
        });
}
function offlineStart() {
    settings.spellcheck = false;
    document.getElementById("spellcheck").checked = false;
    document.getElementById("spellcheckContainer").style.color = red;
    document.getElementById("spellcheckContainer").style.opacity = "0.5";
    let pzs = [
        '{"size":10,"words":[{"id":0,"location":"2,1","direction":"horizontal","word":"FUTURE","attempts":[],"hint":"A later date"},{"id":1,"location":"1,2","direction":"vertical","word":"BUSINESS","attempts":[],"hint":"Not a casual enviornment"},{"id":2,"location":"6,1","direction":"horizontal","word":"LEADERS","attempts":[],"hint":"People who can direct others well"},{"id":3,"location":"1,6","direction":"vertical","word":"NETWORK","attempts":[],"hint":"Create connections with others"},{"id":4,"location":"4,1","direction":"horizontal","word":"TIME","attempts":[],"hint":"What a clock tells"},{"id":5,"location":"1,4","direction":"vertical","word":"JUNE","attempts":[],"hint":"When the FBLA National Leadership Conference takes place"}]}',
        '{"size":10,"words":[{"id":"0","location":"2,1","direction":"horizontal","word":"PROGRAM","attempts":[],"hint":"Another word  for code"},{"id":"1","location":"1,3","direction":"vertical","word":"CONSTANT","attempts":[],"hint":"Never changing"},{"id":"2","location":"2,5","direction":"vertical","word":"RANDOM","attempts":[],"hint":"Does not obey a pattern"},{"id":"3","location":"5,1","direction":"horizontal","word":"DATED","attempts":[],"hint":"Another word for old"},{"id":"4","location":"7,3","direction":"horizontal","word":"NAME","attempts":[],"hint":"A type of identifier"}]}',
        '{"size":11,"words":[{"id":0,"location":"1,3","direction":"horizontal","word":"JACKET","attempts":[],"hint":"For colder weather"},{"id":1,"location":"1,3","direction":"vertical","word":"JEANS","attempts":[],"hint":"Legwear"},{"id":2,"location":"3,1","direction":"horizontal","word":"FLANNEL","attempts":[],"hint":"Stylish outer clothing"},{"id":3,"location":"5,3","direction":"horizontal","word":"SHOES","attempts":[],"hint":"For your feet"},{"id":4,"location":"5,7","direction":"vertical","word":"SHIRT","attempts":[],"hint":"Key part of an outfit"},{"id":5,"location":"6,7","direction":"horizontal","word":"HAT","attempts":[],"hint":"Wear this on your head"},{"id":6,"location":"3,9","direction":"vertical","word":"PANTS","attempts":[],"hint":"Wear this on your legs"}]}',
    ];
    dataList = JSON.parse(pzs[Math.floor(Math.random() * pzs.length)]);
    loadNewPuzzle();
}

function togglePopup(popupName) {
    let popup = document.getElementById(popupName);
    if (popup.style.display == 'none')
        popup.style.display = 'inline';
    else
        popup.style.display = 'none';
}

onlineStart();

// DEV:
puzzleFile.addEventListener("change", function (e) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(e.target.files[0]);
});
function onReaderLoad(event) {
    try {
        var obj = JSON.parse(event.target.result);
        dataList = obj;
        loadNewPuzzle();
    }
    catch {
        alert("ERROR: The file you have uploaded is not a Cross Wordle Puzzle!");
    }
}
async function wait(milliseconds) {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
function loadNewPuzzle() {
    try {
        mainTable.innerHTML = "";
        instantiateTable(dataList.size);
        fillTable();
        instantiateKeyboard();
        updateColors();

        let started = false;
        for (let i = 0; i < dataList.words.length; i++) {
            if (dataList.words[i].attempts.length > 0) {
                started = true;
                break;
            }
        }

        if (!started)
            return;

        for (let i = 0; i < dataList.words.length; i++) {
            for (let j = 0; j < dataList.words[i].word.length; j++) {
                document.getElementById(getPos(dataList.words[i].id, j)).innerHTML = dataList.words[i].attempts[dataList.words[i].attempts.length - 1][j];
            }
        }

        updateColors();
    }
    catch {
        console.error("Error loading new puzzle");
    }
}

async function autocomplete() {
    for (let i = 0; i < dataList.words.length; i++) {
        selectWord(dataList.words[i].id);
        enterString(dataList.words[i].word);
        await new Promise((resolve) => setTimeout(resolve, 500));
        closeWordleTable();
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
}

function saveGame() {
    data = JSON.stringify(dataList);
    downloadToFile(data, "CrossWordleSave.json", "text/plain")
}

const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};

function finishGame() {
    let name = "Null";
    let scores = localStorage.getItem("crossWordleScores").split(",");
    if (pointsValue > document.getElementById("letters5").innerHTML * 1)
        name = prompt("Congrats, you're on the leaderboard! What is your name?");
    else
        name = (prompt("What is your name?"));
    scores.push(pointsValue + "");
    scores.push(name);
    localStorage.setItem("crossWordleScores", scores);
    fillBoard();
    togglePopup('leaderboards');
}

let settingsChecks = document.getElementsByClassName("settingsCheck");
for (let i = 0; i < settingsChecks.length; i++) {
    settingsChecks[i].addEventListener("change", function (event) {
        let check = document.getElementById(event.target.id);
        if (check.checked)
            settings[event.target.id.toLowerCase()] = true;
        else
            settings[event.target.id.toLowerCase()] = false;
        updateColors();
    });
}

function toggleDemo() {
    if (settings.demo == "true") {
        settings.demo = "false";
        console.log("Demo mode inactive");
    }
    else {
        settings.demo = "true";
        console.log("Demo mode active");
    }
    localStorage.setItem('crossWordleDemoMode', settings.demo);
}