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
        this.x = Math.round(this.trueX / spaceWidth);
        this.y = Math.round(this.trueY / spaceWidth);
        this.trueX = this.x * spaceWidth;
        this.trueY = this.y * spaceWidth;
        this.takePiece();
    }

    getLegalMoves(board) {
        let moves = [];
        if (this.type == '♜') { } // Rook
        return moves;
    }

    takePiece() {
        console.log(board[this.x][this.y])
        if (board[this.x][this.y].piece != null)
            board[this.x][this.y].piece = this;
        // Set board piece to this piece
    }
}