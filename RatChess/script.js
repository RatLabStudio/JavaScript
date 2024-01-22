// Rat Chess - Rat Lab Studio 2023

setInterval(function () {
    // Displaying the currently selected piece:
    if (currentPiece != null)
        document.getElementById("info").innerHTML = `
            ${currentPiece.type}
            <br>
            <span style="font-family: sans-serif; font-weight: normal; font-size: 3vh;">
            ${spaceLetterOrder[currentPiece.x].toUpperCase()}${Math.abs((currentPiece.y * 1) - boardSize)}
            </span>
        `;
    else
        document.getElementById("info").innerHTML = `
            <span style="filter: opacity(25%);">
                ${pieces.white.rook}
                <br>
                <span style="font-family: sans-serif; font-weight: normal; font-size: 3vh;">
                    A0
                </span>
            </span>
        `;
    redraw();
}, 1);


// Start of program:
ctx.fillStyle = "black";
var merida = new FontFace('merida', 'url(pieces/merida.ttf)');
merida.load().then(function (font) {
    ctx.font = `${spaceWidth}px merida`;
});
createBoard();
drawSpaces();
setTimeout(function () { fillBoard() }, 300);