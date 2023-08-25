const mainTable = document.getElementById("mainTable");
const menu = document.getElementById("menu");
const red = "rgb(255, 75, 75)", green = "rgb(108, 255, 89)", orange = "rgb(255, 195, 74)";
var dataList = "";

var words = [];

var selectedSpace = null;

// Menus
const sizeInput = document.getElementById("size");
const locationInput = document.getElementById("location");
const wordInput = document.getElementById("word");
const hintInput = document.getElementById("hint");
const directionInput = document.getElementById("direction");
const puzzleFile = document.getElementById("puzzleFile");

directionInput.addEventListener("click", function () {
    if (directionInput.innerHTML == "Horizontal")
        directionInput.innerHTML = "Vertical";
    else
        directionInput.innerHTML = "Horizontal";
});

function instantiateTable(size) {
    for (let i = 0; i < size; i++) {
        mainTable.innerHTML += "<tr id='mainTableRow" + i + "'></tr>"
        for (let j = 0; j < size; j++) {
            document.getElementById("mainTableRow" + i).innerHTML += "<td class='space' id='" + i + "," + j + "'> </td>"
        }
        mainTable.innerHTML += "<br>"
    }
    let spaces = document.getElementsByClassName("space");
    for (let i = 0; i < spaces.length; i++) {
        spaces[i].addEventListener("click", event => {
            locationInput.value = event.target.id;
            selectedSpace = event.target.id;
            for (let i = 0; i < dataList.words.length; i++)
                unhighlightWord(i);
            selectedWordId = -1;
        });
    }
}

instantiateTable(sizeInput.value);

function getPos(index) {
    let initialPos = locationInput.value.split(",");
    let pos = initialPos;
    if (directionInput.innerHTML == "Horizontal")
        pos[1] = initialPos[1] * 1 + index * 1;
    else
        pos[0] = initialPos[0] * 1 + index * 1;
    return pos;
}

function addWord() {
    let word = wordInput.value.toUpperCase();
    let hint = hintInput.value;
    for (let i = 0; i < word.length; i++) {
        let space = null;
        space = document.getElementById(getPos(i)[0] + "," + getPos(i)[1]);
        space.innerHTML = word[i];
        space.style.backgroundColor = "aliceblue";
        space.className += " " + dataList.words.length;
    }
    let wordObj = {
        "id": dataList.words.length,
        "location": locationInput.value,
        "direction": directionInput.innerHTML.toLowerCase(),
        "word": word,
        "attempts": [],
        "hint": hint,
    };
    dataList.words.push(wordObj);
    wordInput.value = "";
    loadNewPuzzle();
}

function save() {
    data = JSON.stringify(dataList);
    downloadToFile(data, "CrossWordlePuzzle.json", "text/plain")
}

const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};

function togglePopup(popupName) {
    let popup = document.getElementById(popupName);
    if (popup.style.display == 'none')
        popup.style.display = 'inline';
    else
        popup.style.display = 'none';
}

function wordleGetPos(id, index) {
    let initialPos = dataList.words[id].location.split(",");
    let pos = initialPos;
    if (dataList.words[id].direction == "horizontal")
        pos[1] = initialPos[1] * 1 + index * 1;
    else
        pos[0] = initialPos[0] * 1 + index * 1;
    return pos;
}
var selectedWordId = null;
function fillTable() {
    for (let i = 0; i < dataList.words.length; i++) {
        for (let j = 0; j < dataList.words[i].word.length; j++) {
            let space = document.getElementById(wordleGetPos(dataList.words[i].id, j)[0] + "," + wordleGetPos(dataList.words[i].id, j)[1]);
            space.innerHTML = dataList.words[i].word[j];
            space.className += " " + dataList.words[i].id + " ";
            space.style.backgroundColor = "aliceblue";

            space.addEventListener("mouseover", event => {
                let spaceClasses = event.target.classList;
                let k = 0;
                while (spaceClasses[k] * 1 == NaN)
                    k++
                highlightWord(spaceClasses[1]);
            });
            space.addEventListener("mouseout", event => {
                let spaceClasses = event.target.classList;
                let k = 0;
                while (spaceClasses[k] * 1 == NaN)
                    k++
                if (selectedWordId != spaceClasses[1])
                    unhighlightWord(spaceClasses[1]);
            });
            space.addEventListener("click", event => {
                let spaceClasses = event.target.classList;
                let k = 0;
                while (spaceClasses[k] * 1 == NaN)
                    k++
                selectedWordId = spaceClasses[1];
                for (let i = 0; i < dataList.words.length; i++)
                    unhighlightWord(i);
                highlightWord(spaceClasses[1]);
            });
        }
    }
}

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
function loadNewPuzzle() {
    try {
        mainTable.innerHTML = "";
        instantiateTable(dataList.size);
        fillTable();
        sizeInput.value = dataList.size;
    }
    catch (e) {
        console.log(e)
        console.error("Error loading puzzle")
    }
}

function highlightWord(id) {
    let wordSpaces = getWordSpaces(id);
    for (let i = 0; i < wordSpaces.length; i++)
        wordSpaces[i].style.backgroundColor = "lightskyblue";
}

function unhighlightWord(id) {
    let wordSpaces = getWordSpaces(id);
    for (let i = 0; i < wordSpaces.length; i++)
        wordSpaces[i].style.backgroundColor = "aliceblue";
}

function getWordSpaces(id) {
    let arr = []
    for (let i = 0; i < dataList.words[id].word.length; i++) {
        arr.push(document.getElementById(wordleGetPos(id, i)[0] + "," + wordleGetPos(id, i)[1]));
    }
    return arr;
}

function removeWord() {
    dataList.words.splice(selectedWordId, 1);
    for (let i = 0; i < dataList.words.length; i++) {
        if (dataList.words[i].id > selectedWordId)
            dataList.words[i].id--;
    }
    loadNewPuzzle();
}

var loaded = false;

function onlineStart() { //For if the site is on a server (or VSCode Live Server)
    fetch('template.json')
        .then(response => response.text())
        .then(data => {
            dataList = JSON.parse(data);
            loadNewPuzzle();
            loaded = true;
        })
        .catch(err => {
            console.clear();
            console.error("Error: Cannot Access Online Puzzles");
            alert("NOTICE: CrossWordle Editor is meant to be run on an online website. CrossWordle Editor will now run in offline mode")
            offlineStart();
        });
}

onlineStart();

setInterval(function () {
    if (!loaded)
        return;
    for (let i = 0; i < sizeInput.value; i++) {
        for (let j = 0; j < sizeInput.value; j++) {
            if (document.getElementById(i + "," + j).className == "space")
                document.getElementById(i + "," + j).style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        }
    }
    if (selectedWordId != null && selectedWordId != -1)
        highlightWord(selectedWordId);
    if (selectedSpace != null)
        document.getElementById(selectedSpace).style.backgroundColor = green;
}, 1);