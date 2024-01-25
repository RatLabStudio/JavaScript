// Draws every space
function drawSpaces() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let space = board[i][j];
            if (space.color)
                ctx.fillStyle = "cadetblue";
            else
                ctx.fillStyle = "rgba(25,25,0,0.15)";
            ctx.fillRect(space.x * spaceWidth, space.y * spaceWidth, spaceWidth, spaceWidth);
        }
    }
}

// Draws the labels on the left and bottom of the board
function drawLabels() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    for (let i = 0; i < boardSize; i++) {
        ctx.font = spaceWidth * 0.25 + "px sans-serif"
        let offset = 0;
        if (i == boardSize - 1)
            offset = 24;
        ctx.fillText(`${boardSize - i}`, 5 + offset, (i + 1) * spaceWidth - 5)
        ctx.fillText(`${spaceLetterOrder[i].toUpperCase()}`, i * spaceWidth + 5, canvas.height - 5);
    }
}

// Draws a piece on the game board
function drawPiece(piece) {
    ctx.font = `${spaceWidth}px merida`;
    ctx.fillStyle = "black";
    ctx.fillText(piece.type, piece.trueX, piece.trueY + (spaceWidth * 0.8));
}

// Redraws all game components
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpaces();
    drawLabels();
    for (let i = 0; i < piecesInBoard.length; i++)
        drawPiece(piecesInBoard[i]);
}