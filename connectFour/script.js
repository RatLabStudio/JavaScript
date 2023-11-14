// Connect Four - Rat Lab Studio 2023 - https://ratlabstudio.com

const gameBoard = document.getElementById("gameBoard");

let boardWidth = 7, boardHeight = 6; // Determines dimensions of game board
let amountToWin = 4; // Amount of coins in a row required to win
let spaces = []; // Populated with every space on the board upon creation
let colors = ["red", "yellow"] // Two color options, correspond with CSS classes
let turn = colors[0]; // Keeps track of what color to use
let winner = ""; // Winner of the game

function createGameBoard() {
    // Create Game Board and Spaces:
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
    winner = ""; // Sets winner to empty string to tell program there is no winner yet

    // Space actions and event listeners:
    for (let y = 0; y < boardHeight; y++)
        for (let x = 0; x < boardWidth; x++) {
            spaces.push(document.getElementById(`${y},${x}`));
            spaces[spaces.length - 1].addEventListener("click", function (event) {
                if (winner != null && winner != undefined && winner != "")
                    return;
                let id = event.target.id;
                placeCoin(id); // Place a coin in the row of the space clicked
            });

            // Hovering styles
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

// Places a coin in a column with gravity, given the id of a space in that column
function placeCoin(id) {
    id = id.replace("coin", ""); // Sometimes the user clicks on an actual coin
    let space = document.getElementById(id);
    if (space.style.backgroundColor == colors[0] || space.style.backgroundColor == colors[1])
        return;
    let spacesInColumn = getSpacesInColumn(id[2]); // Finds all spaces in the column of the given space
    // Go through all spaces in the column, starting from the bottom one
    for (let i = spacesInColumn.length - 1; i >= 0; i--) {
        let isPopulated = false; // Assume spaces are not populated until otherwise is determined
        for (let j = 0; j < colors.length; j++) {
            if (spacesInColumn[i].classList.length > 0) // If the space has a class, meaning it has something in it
                isPopulated = true; // The space is populates
        }
        if (isPopulated) // Skip this space if it is populated
            continue;
        else { // If this space is not populated
            spacesInColumn[i].classList.add(turn); // Add the class of the current turn so the program remembers there is something in the space
            spacesInColumn[i].innerHTML = `<div id="coin${spacesInColumn[i].id}" class="coin ${turn}Coin"></div>`; // Place a coin
            document.getElementById(`coin${spacesInColumn[i].id}`).style.bottom = "0px"; // Set the coin to be at the bottom of the space
            checkForWin(); // Check if anyone has won
            switchTurn(); // Switch turns
            break;
        }
    }
}

// Converts a 1D array index to a 2D grid location (both zero-based)
function convert1Dto2D(index) {
    return [Math.floor(index / boardWidth), Math.floor(index % boardWidth)];
}

// Converts a 2D grid location to a 1D array index (both zero-based)
function convert2Dto1D(y, x) {
    return ((y * 1) * boardWidth) + (x * 1);
}

// Checks if any player has won the game
function checkForWin() {
    for (let i = 0; i < spaces.length; i++) {
        let y = spaces[i].id[0] * 1;
        let x = spaces[i].id[2] * 1;

        if (spaces[i].classList.length <= 0)
            continue;

        // Horizontal:
        if (spaces[i].id[2] * 1 < boardWidth - (amountToWin - 1)) {
            let count = 1;
            for (let j = 1; j < amountToWin; j++) {
                if (spaces[i].classList[0] == spaces[convert2Dto1D(y, x + j)].classList[0])
                    count++;
            }
            if (count >= amountToWin) {
                winner = spaces[i].classList[0];
                win();
                return;
            }
        }

        // Vertical
        if (spaces[i].id[0] * 1 < boardHeight - (amountToWin - 1)) {
            let count = 1;
            for (let j = 1; j < amountToWin; j++) {
                if (spaces[i].classList[0] == spaces[convert2Dto1D(y + j, x)].classList[0])
                    count++;
            }
            if (count >= amountToWin) {
                winner = spaces[i].classList[0];
                win();
                return;
            }
        }

        // Diagonal Negative Slope
        if (spaces[i].id[2] * 1 < boardWidth - (amountToWin - 1) && spaces[i].id[0] * 1 < boardHeight - (amountToWin - 1)) {
            let count = 1;
            for (let j = 1; j < amountToWin; j++) {
                if (spaces[i].classList[0] == spaces[convert2Dto1D(y + j, x + j)].classList[0])
                    count++;
            }
            console.log(count)
            if (count >= amountToWin) {
                winner = spaces[i].classList[0];
                win();
                return;
            }
        }

        // Diagonal Positive Slope
        if (spaces[i].id[2] * 1 < boardWidth + (amountToWin - 1) && spaces[i].id[0] * 1 < boardHeight - (amountToWin - 1)) {
            let count = 1;
            for (let j = 1; j < amountToWin; j++) {
                if (spaces[i].classList[0] == spaces[convert2Dto1D(y + j, x - j)].classList[0])
                    count++;
            }
            if (count >= amountToWin) {
                winner = spaces[i].classList[0];
                win();
                return;
            }
        }
    }

}

function win() {
    if (winner != undefined && winner != null && winner != "") {
        let winnerDisplay = document.getElementById("winnerDisplay");
        winnerDisplay.innerHTML = winner[0].toUpperCase() + winner.substring(1) + " Wins!";
        if (winner == "red")
            winnerDisplay.style.color = "tomato";
        else if (winner == "yellow")
            winnerDisplay.style.color = "gold";
        document.getElementById("winnerPanel").style.visibility = "unset";
    }
}

// Returns all the spaces in a given column
function getSpacesInColumn(column) {
    let cSpaces = [];
    for (let i = 0; i < spaces.length; i++) {
        if (spaces[i].id[2] * 1 == column)
            cSpaces.push(spaces[i]);
    }
    return cSpaces;
}

// Rotates the turn between 0 and 1
function switchTurn() {
    if (turn == colors[0])
        turn = colors[1];
    else
        turn = colors[0];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Resets the game and plays an animation
function resetBoard() {
    document.getElementById("winnerPanel").style.visibility = "hidden"; // Hides the winner display panel
    document.getElementById("winnerDisplay").innerHTML = "Nobody Wins!"; // Default winner is nobody
    for (let i = 0; i < spaces.length; i++) { // For every space
        if (spaces[i].classList.length < 1)
            continue;
        document.getElementById("coin" + spaces[i].id).classList.add("falling"); // Add the falling animation
    }
    sleep(1500).then(() => {
        createGameBoard(); // Recreates the game board
    });
}

createGameBoard();