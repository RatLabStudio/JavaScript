function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

canvas.addEventListener("mousedown", function (event) {
    let mousePos = getMousePos(canvas, event);
    let p = getPieceAtCoordinates(mousePos.x, mousePos.y);
    if (p == null || p == undefined)
        return;
    canvas.style.cursor = "move";
    currentPiece = p;
    redraw();
});
document.addEventListener("mouseup", function (event) {
    if (currentPiece != null) {
        if (currentPiece.color) {
            if (turn.toLowerCase() == "white")
                currentPiece.putBack();
            else {
                currentPiece.place();
                switchTurn();
            }
        }
        else {
            if (turn.toLowerCase() == "black")
                currentPiece.putBack();
            else {
                currentPiece.place();
                switchTurn();
            }
        }
    }
    currentPiece = null;
    canvas.style.cursor = "default";
});

function getPieceBounds(piece) {
    return {
        top: piece.y * spaceWidth,
        bottom: piece.y * spaceWidth + spaceWidth,
        left: piece.x * spaceWidth,
        right: piece.x * spaceWidth + spaceWidth
    };
}

function getPieceAtCoordinates(x, y) {
    for (let i = 0; i < piecesInBoard.length; i++) {
        let p = getPieceBounds(piecesInBoard[i]);
        if (x >= p.left && x <= p.right && y >= p.top && y <= p.bottom)
            return piecesInBoard[i];
    }
}

canvas.addEventListener("mousemove", function (event) {
    let mousePos = getMousePos(canvas, event);
    hoverSpace = null;
    if (getPieceAtCoordinates(mousePos.x, mousePos.y) != undefined && currentPiece == null) {
        canvas.style.cursor = "pointer";
        hoverSpace = getPieceAtCoordinates(mousePos.x, mousePos.y);
    }
    else if (currentPiece == null)
        canvas.style.cursor = "default";
    if (currentPiece == null)
        return;
    currentPiece.trueX = Math.floor(mousePos.x - spaceWidth / 2);
    currentPiece.trueY = Math.floor(mousePos.y - spaceWidth / 2);
}, 1);