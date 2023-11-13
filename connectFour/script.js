const gameBoard = document.getElementById("gameBoard");

let boardWidth = 7, boardHeight = 6;
let spaces = [];
let colors = ["red", "yellow"]
let turn = colors[0];

function createGameBoard() {
    let temp = '';
    for (let y = 0; y < boardHeight; y++) {
        temp += `<tr>`;
        for (let x = 0; x < boardWidth; x++) {
            temp += `<td id='${y},${x}'></td>`;
        }
        temp += `</tr>`;
    }
    gameBoard.innerHTML = temp;
    spaces = [];
    turn = colors[0];
    winner = "";
    for (let y = 0; y < boardHeight; y++)
        for (let x = 0; x < boardWidth; x++) {
            spaces.push(document.getElementById(`${y},${x}`));
            spaces[spaces.length - 1].addEventListener("click", function (event) {
                if (winner != null && winner != undefined && winner != "")
                    return;
                let id = event.target.id;
                placeCoin(id);
            });

            spaces[spaces.length - 1].addEventListener("mouseover", function (event) {
                let columnSpaces = getSpacesInColumn(event.target.id[2]);
                for (let c = 0; c < columnSpaces.length; c++) {
                    columnSpaces[c].style.filter = "brightness(150%)";
                }
            });

            spaces[spaces.length - 1].addEventListener("mouseout", function (event) {
                let columnSpaces = getSpacesInColumn(event.target.id[2]);
                for (let c = 0; c < columnSpaces.length; c++) {
                    columnSpaces[c].style.filter = "";
                }
            });
        }
}

function placeCoin(id) {
    id = id.replace("coin", "");
    let space = document.getElementById(id);
    if (space.style.backgroundColor == colors[0] || space.style.backgroundColor == colors[1])
        return;
    let spacesInColumn = getSpacesInColumn(id[2]);
    for (let i = spacesInColumn.length - 1; i >= 0; i--) {
        let isPopulated = false;
        for (let j = 0; j < colors.length; j++) {
            if (spacesInColumn[i].classList.length > 0)
                isPopulated = true;
        }
        if (isPopulated)
            continue;
        else {
            spacesInColumn[i].classList.add(turn);
            spacesInColumn[i].innerHTML = `<div id="coin${id}" class="coin ${turn}Coin"></div>`;
            document.getElementById(`coin${id}`).style.bottom = "0px";
            checkForWin();
            switchTurn();
            break;
        }
    }
}

function convert1Dto2D(index) {
    return [Math.floor(index / boardWidth), Math.floor(index % boardWidth)];
}

function convert2Dto1D(y, x) {
    return ((y * 1) * boardWidth) + (x * 1);
}

let winner = "";
function checkForWin() {
    for (let i = 0; i < spaces.length; i++) {
        let y = spaces[i].id[0] * 1;
        let x = spaces[i].id[2] * 1;

        if (spaces[i].classList.length <= 0)
            continue;

        if (
            spaces[i].id[2] * 1 < boardWidth - 3
            && spaces[i].classList[0] == spaces[convert2Dto1D(y, x + 1)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y, x + 2)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y, x + 3)].classList[0]
        ) {
            winner = spaces[i].classList[0];
            break;
        }

        else if (
            spaces[i].id[0] * 1 < boardHeight - 3
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 1, x)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 2, x)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 3, x)].classList[0]
        ) {
            winner = spaces[i].classList[0];
            break;
        }

        else if (
            spaces[i].id[2] * 1 < boardWidth - 3
            && spaces[i].id[0] * 1 < boardHeight - 3
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 1, x + 1)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 2, x + 2)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 3, x + 3)].classList[0]
        ) {
            winner = spaces[i].classList[0];
            break;
        }

        else if (
            spaces[i].id[2] * 1 < boardWidth + 3
            && spaces[i].id[0] * 1 < boardHeight - 3
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 1, x - 1)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 2, x - 2)].classList[0]
            && spaces[i].classList[0] == spaces[convert2Dto1D(y + 3, x - 3)].classList[0]
        ) {
            winner = spaces[i].classList[0];
            break;
        }
    }
    if (winner != undefined && winner != null && winner != "") {
        document.getElementById("winnerDisplay").innerHTML = winner[0].toUpperCase() + winner.substring(1) + " Wins!";
        document.getElementById("winnerPanel").style.visibility = "unset";
    }
}

function getSpacesInColumn(column) {
    let cSpaces = [];
    for (let i = 0; i < spaces.length; i++) {
        if (spaces[i].id[2] * 1 == column)
            cSpaces.push(spaces[i]);
    }
    return cSpaces;
}

function switchTurn() {
    if (turn == colors[0])
        turn = colors[1];
    else
        turn = colors[0];
}

function resetBoard() {
    document.getElementById("winnerPanel").style.visibility = "hidden";
    document.getElementById("winnerDisplay").innerHTML = "Nobody Wins!";
    createGameBoard();
}

createGameBoard();