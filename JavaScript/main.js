const fs = require('fs');

// Variables
const player1Board = Array.from({ length: 9 }, () => []);
const player2Board = Array.from({ length: 9 }, () => []);
const player1Hand = [];
const player2Hand = [];
const wordPool = [];

// Fill the word pool
function fillWordPool() {
    try {
        const data = fs.readFileSync('words/ods6.txt', 'utf8');
        const words = data.split('\n');
        wordPool.push(...words);
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}

// Function to fill the letter pool
//There is : 14 A, 4 B, 7 C, 5 D, 19 E, 2 F, 4 G, 2 H, 11  I, 1 J, 1 K, 6 L, 5 M, 9 N, 8 O, 4 P, 1 Q, 10 R, 7 S, 9 T, 8 U, 2 V, 1 W, 1 X, 1 Y, 2 Z
function fillLetterPool() {
    letterPool.push(...Array(14).fill('A'));
    letterPool.push(...Array(4).fill('B'));
    letterPool.push(...Array(7).fill('C'));
    letterPool.push(...Array(5).fill('D'));
    letterPool.push(...Array(19).fill('E'));
    letterPool.push(...Array(2).fill('F'));
    letterPool.push(...Array(4).fill('G'));
    letterPool.push(...Array(2).fill('H'));
    letterPool.push(...Array(11).fill('I'));
    letterPool.push('J');
    letterPool.push('K');
    letterPool.push(...Array(6).fill('L'));
    letterPool.push(...Array(5).fill('M'));
    letterPool.push(...Array(9).fill('N'));
    letterPool.push(...Array(8).fill('O'));
    letterPool.push(...Array(4).fill('P'));
    letterPool.push('Q');
    letterPool.push(...Array(10).fill('R'));
    letterPool.push(...Array(7).fill('S'));
    letterPool.push(...Array(9).fill('T'));
    letterPool.push(...Array(8).fill('U'));
    letterPool.push(...Array(2).fill('V'));
    letterPool.push('W');
    letterPool.push('X');
    letterPool.push('Y');
    letterPool.push(...Array(2).fill('Z'));
}


// Function to randomly choose a player
function randomPlayer() {
    return Math.random() < 0.5 ? 'Player 1' : 'Player 2';
}

// Function to draw a letter from the letter pool
function drawLetter() {
    const randomIndex = Math.floor(Math.random() * letterPool.length);
    const letter = letterPool.splice(randomIndex, 1)[0];
    return letter;
}

// Function to display the board and letters in hand
function displayBoardAndLetters(playerBoard, lettersInHand) {
    console.log('Board:');
    console.log(playerBoard);
    console.log('Letters in hand:');
    console.log(lettersInHand);
}

// Function to check if a word can be played in the first empty line
function canPlayWord(playerBoard, word) {
    const emptyLineIndex = playerBoard.findIndex((line) => line.length === 0);
    if (emptyLineIndex === -1) {
        return false; // No empty line available
    }
    // Check if the word can be played in the empty line

    return true;
}

// Function to play a word in the first empty line
function playWord(playerBoard, word) {
    const emptyLineIndex = playerBoard.findIndex((line) => line.length === 0);
    if (emptyLineIndex === -1) {
        return false; // No empty line available
    }
    // Play the word in the empty line

    return true;
}

// Function to add a letter to an existing word
function addLetterToWord(playerBoard, lineIndex, wordIndex, letter) {
    // Add the letter to the specified word in the line

}

// Function to exchange 3 letters from the player's hand
function exchangeLetters(lettersInHand) {
    // Exchange 3 letters from the player's hand

}

// Function to check if a player can Jarnac the opponent's word
function canJarnac(playerBoard, opponentBoard) {
    // Check if the player can Jarnac the opponent's word

    return true;
}

// Function to steal the opponent's word and place it on the player's board
function jarnacAndSteal(playerBoard, opponentBoard) {
    // Jarnac the opponent's word and steal it

}

// Function to check if the game is over
function isGameOver(playerBoard, opponentBoard) {
    // Check if the game is over

    return false;
}

// Function to calculate the score of a player
function calculateScore(playerBoard) {
    // Calculate the score of a player

    return 0;
}

// Function to play a turn for a player
function playTurn(playerBoard, opponentBoard, lettersInHand) {
    // Play a turn for a player

}

// Main game loop
function playGame() {
    let currentPlayer = randomPlayer();
    let gameOver = false;
    fillWordPool();
    fillLetterPool();

    while (!gameOver) {
        console.log(`It's ${currentPlayer}'s turn.`);
        playTurn(currentPlayer === 'Player 1' ? player1Board : player2Board, currentPlayer === 'Player 1' ? player2Board : player1Board, currentPlayer === 'Player 1' ? player2Hand : player1Hand);
        currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
        gameOver = isGameOver(player1Board, player2Board);
    }

    const player1Score = calculateScore(player1Board);
    const player2Score = calculateScore(player2Board);

    console.log('Game over!');
    console.log(`Player 1 score: ${player1Score}`);
    console.log(`Player 2 score: ${player2Score}`);
    console.log(`The winner is ${player1Score > player2Score ? 'Player 1' : 'Player 2'}`);
}

// Start the game
playGame();