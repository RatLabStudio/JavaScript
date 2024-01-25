function createBoard() {
    board = [];
    let color = true; // Color to start with on the bottom left (Assuming even boardSize)
    for (let i = 0; i < boardSize; i++) {
        board.push([])
        for (let j = 0; j < boardSize; j++) {
            color = !color;
            board[i].push(new space(i, j, color));
        }
        if (boardSize % 2 == 0)
            color = !color;
    }
}

function fillBoard() {
    piecesInBoard = [];
    for (let i = 0; i < boardSize; i++) {
        // Top Player
        // Back Row
        let p = new piece(i, 0, pieces.black[boardSetup[i]], true);
        board[i][0].piece = p;
        drawPiece(p);
        piecesInBoard.push(p);
        // Front Row (Pawns)
        let p2 = new piece(i, 1, pieces.black.pawn, true);
        board[i][1].piece = p2;
        drawPiece(p2);
        piecesInBoard.push(p2);

        // Bottom Player
        // Back Row
        let p3 = new piece(i, boardSize - 1, pieces.white[boardSetup[i]], false);
        board[i][boardSize - 1].piece = p3;
        drawPiece(p3);
        piecesInBoard.push(p3);
        // Front Row (Pawns)
        let p4 = new piece(i, boardSize - 2, pieces.white.pawn, false);
        board[i][boardSize - 2].piece = p4;
        drawPiece(p4);
        piecesInBoard.push(p4);
    }
}

function resetBoard() {
    createBoard();
    fillBoard();
    turn = "White";
}