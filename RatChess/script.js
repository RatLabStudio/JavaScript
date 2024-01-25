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
            <h2 style="font-family: sans-serif; font-size: 2vh;">${turn}'s Turn</h2>
        `;
    else if (hoverSpace != null)
        document.getElementById("info").innerHTML = `
            <span style="filter: opacity(50%);">
                ${hoverSpace.type}
                <br>
                <span style="font-family: sans-serif; font-weight: normal; font-size: 3vh;">
                    ${spaceLetterOrder[hoverSpace.x].toUpperCase()}${Math.abs((hoverSpace.y * 1) - boardSize)}
                </span>
            </span>
            <h2 style="font-family: sans-serif; font-size: 2vh;">${turn}'s Turn</h2>
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
            <h2 style="font-family: sans-serif; font-size: 2vh;">${turn}'s Turn</h2>
        `;
    redraw();
}, 1);

if (window.innerWidth < 500)
    alert("Warning: This page is built with a desktop in mind. Using it on a phone will likely cause it to not function properly!")

// Start of program:
ctx.fillStyle = "black";
var merida = new FontFace('merida', 'url(pieces/merida.ttf)');
merida.load().then(function (font) {
    ctx.font = `${spaceWidth}px merida`;
});
createBoard();
drawSpaces();
setTimeout(function () { fillBoard() }, 300);