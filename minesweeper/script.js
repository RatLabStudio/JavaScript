const gameBoard = document.getElementById("gameBoard");

let boardSize = 32;

for (let i = 0; i < boardSize; i++) {
    let temp = "<tr>";
    for (let j = 0; j < boardSize; j++) {
        temp += `
            <td id="${i},${j}"></td>
        `;
    }
    temp += "</tr>";
    gameBoard.innerHTML += temp;
}