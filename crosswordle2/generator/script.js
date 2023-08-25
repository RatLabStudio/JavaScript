let startingLetter = String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65).toLowerCase();
console.log(startingLetter);
let locations = ["1,1", "1,2", "3,2", "3,5", "5,5", "5,7", "5,1", "5,3"];
let directions = ["horizontal", "vertical", "horizontal", "vertical", "horizontal", "vertical", "horizontal", "vertical"];
let words = [];

function getWord(length, letter, location) {
    return fetch('words/' + length + '.txt')
        .then(response => response.text())
        .then(data => {
            const wordList = data.split('\n');
            let i = 0, word = "";
            while (true) {
                i = Math.floor(Math.random() * wordList.length);
                if (wordList[i][location] == letter && wordList[i].indexOf("-") == -1 && wordList[i].indexOf("/") == -1 && wordList[i].indexOf("'") == -1) {
                    word = wordList[i].replace("\r", "");
                    break;
                }
            }
            return word;
        })
        .catch(error => {
            console.error('Error:', error);
            return false; // Return false in case of an error
        });
}

function save() {
    data = JSON.stringify(dataList);
    downloadToFile(data, "CrossWordleGeneratedPuzzle.json", "text/plain")
}

const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};

var dataList;
function onlineStart() { //For if the site is on a server (or VSCode Live Server)
    fetch('template.json')
        .then(response => response.text())
        .then(data => {
            dataList = JSON.parse(data);
            getWord(6, startingLetter, 1)
                .then(result1 => {
                    words.push(result1);
                    getWord(5, result1[1], 0)
                        .then(result2 => {
                            words.push(result2);
                            getWord(5, result2[2], 0)
                                .then(result3 => {
                                    words.push(result3);
                                    getWord(6, result3[3], 0)
                                        .then(result4 => {
                                            words.push(result4);
                                            getWord(4, result4[2], 0)
                                                .then(result5 => {
                                                    words.push(result5);
                                                    getWord(4, result5[2], 0)
                                                        .then(result6 => {
                                                            words.push(result6);
                                                            getWord(3, result2[4], 1)
                                                                .then(result7 => {
                                                                    words.push(result7);
                                                                    getWord(4, result7[2], 0)
                                                                        .then(result8 => {
                                                                            words.push(result8);
                                                                            console.log(words);
                                                                            for (let i = 0; i < words.length; i++) {
                                                                                let wordObj = {
                                                                                    "id": dataList.words.length,
                                                                                    "location": locations[i],
                                                                                    "direction": directions[i],
                                                                                    "word": words[i].toUpperCase(),
                                                                                    "attempts": [],
                                                                                    "hint": "No hint provided.",
                                                                                };
                                                                                dataList.words.push(wordObj);
                                                                            }
                                                                            console.log(dataList);
                                                                            for (let i = 0; i < dataList.words.length; i++) {
                                                                                document.getElementById("list").innerHTML += "<li>" + dataList.words[i].word + "</li><br>";
                                                                            }
                                                                            //save();
                                                                        });
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
        })
        .catch(err => {
            console.clear();
            console.error("Error: Cannot Access Online Words");
            alert("NOTICE: CrossWordle Generator is meant to be run on an online website. CrossWordle Generator will not run in offline mode")
            //offlineStart();
        });
}
onlineStart();