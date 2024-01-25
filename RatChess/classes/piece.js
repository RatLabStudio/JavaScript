class piece {
    constructor(x, y, type, color) {
        this.x = x;
        this.y = y;
        this.trueX = this.x * spaceWidth;
        this.trueY = this.y * spaceWidth;
        this.type = type;
        this.color = color; // Color is true for light, false for dark
    }

    place() {
        let futureSpace = board[Math.round(this.trueX / spaceWidth)][Math.round(this.trueY / spaceWidth)];
        if (futureSpace.piece != null && futureSpace.piece.color == this.color) {
            this.putBack();
            switchTurn();
            return;
        }
        this.x = Math.round(this.trueX / spaceWidth);
        this.y = Math.round(this.trueY / spaceWidth);
        this.trueX = this.x * spaceWidth;
        this.trueY = this.y * spaceWidth;
        this.takePiece();
    }

    putBack() {
        this.trueX = this.x * spaceWidth;
        this.trueY = this.y * spaceWidth;
    }

    getLegalMoves(board) {
        let moves = [];
        if (this.type == '♜') { } // Rook
        return moves;
    }

    takePiece() {
        let takenPiece = board[this.x][this.y].piece;
        if (takenPiece != null && takenPiece != this) { // If there is a piece in the space
            // Move the piece away from the board
            takenPiece.x = -1;
            takenPiece.y = -1;
            takenPiece.trueX = -1000;
            takenPiece.trueY = -1000;
        }
        board[this.x][this.y].piece = this; // Place this piece in the space
    }
}