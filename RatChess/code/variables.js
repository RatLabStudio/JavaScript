const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const boardSize = 8; // How many spaces are on the board
let spaceWidth = canvas.width / boardSize; // Width of each space on the board
let spaceLetterOrder = "abcdefghijklmnopqrstuvwxyz"; // Order of lettering for labels

let pieces = {
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    },
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    }
}

let pieceColors = {
    black: "black",
    white: "white"
}

let board = []; // Contains all the pieces in the board
let currentPiece = null; // Stores the object of the currently held piece

// The order of the pieces in the back row for each person
let boardSetup = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]; // Order of back row of pieces for each player
let piecesInBoard = []; // All pieces currently on the board