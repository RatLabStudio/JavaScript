var c = document.getElementById("canvas");
var cSize = 12;
document.getElementById("size").innerHTML = cSize;
var words = document.getElementById("words");
words.innerHTML = 0;
var biggestID = 0;
var oldSize = cSize;
var data = "";
var letterSet = "";
var grid;
var diff = 0;
var selectedColor = "greenyellow";
function createTable() {
    c.innerHTML = "";
    for (var i = 0; i < cSize; i++) {
        for (var j = 0; j < cSize; j++) {
            c.innerHTML += "<button class='btn' id='" + i + "," + j + "' style='width: 50px; height: 50px; backgroundColor: white;' onclick='btnPress(" + i + "," + j + ")'>" + '.' + "</button>";
        }
        c.innerHTML += "<br>"
    }
    grid = new Array(cSize);
    for (var i = 0; i < cSize; i++) {
        grid[i] = new Array(cSize);
        for (var j = 0; j < cSize; j++) {
            grid[i][j] = '[0,.]';
        }
    }
}
createTable();
function btnPress(i, j) {
    var wordID = document.getElementById("wordID").value;
    if (wordID > biggestID) {
        biggestID = wordID;
        words.innerHTML = biggestID;
    }
    var thisBtn = document.getElementById(i + "," + j);
    if (wordID == "0") {
        thisBtn.style = "width: 50px; height: 50px; backgroundColor: white; color: black;";
        thisBtn.innerHTML = ".";
        return;
    }
    thisBtn.style.backgroundColor = selectedColor;
    var letter = prompt("What letter?");
    thisBtn.innerHTML = letter;
    grid[i][j] = '[' + wordID + ',' + letter + ']';
}
const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};
function ChangeSize(newSize) {
    getData();
    oldSize = cSize;
    cSize = newSize;
    diff = cSize - oldSize;
    createTable();
    Load(data);
}
function getData() {
    data = "";
    data += cSize;
    for (var i = 0; i < cSize; i++) {
        for (var j = 0; j < cSize; j++) {
            data += grid[i][j] + '-';
        }
    }
    data = data.substring(0, data.length - 1)
    data = data.replace('"', '');
    return data;
}
function Save() {
    getData();
    downloadToFile(data, "CrossWordlePuzzle.txt", "text/plain")
}

//LOADING STUFF:
var loadArray;
function parseData(info) {
    var array2D = [];
    elems = info.split("]-[");
    for (var i = 0; i < elems.length; i++) {
        elems[i] = elems[i].replace("[", "").replace("]", "");
        var pieces = elems[i].split(",");
        array2D.push(pieces);
    }
    loadArray = array2D;
}
function Load(toLoad) {
    parseData(toLoad.substring(toLoad.indexOf("["), toLoad.length - 1));
    for (var i = 0; i < cSize; i++) {
        for (var j = 0; j < cSize; j++) {
            var space1D = convertTo1D(i, j);
            grid[i][j] = '[' + loadArray[space1D][0] + ',' + loadArray[space1D][1] + ']';
            document.getElementById(i + "," + j).innerHTML = loadArray[space1D][1];
            if (loadArray[space1D][0] != 0)
                document.getElementById(i + "," + j).style.backgroundColor = selectedColor;
        }
    }
    if (toLoad.substring(0, toLoad.indexOf("[")) * 1 != cSize)
        ChangeSize(toLoad.substring(0, toLoad.indexOf("[")));
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
    return (row * oldSize) + (column * 1);
}