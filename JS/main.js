import * as funcToPlay from './func_to_play.js';
import * as inits from './inits.js';
import * as checks from './checks.js';
 
// Variables
const player1Board = [[] , [] , [] , [] , [] , [] , [] , [] , []];
const player2Board = [[] , [] , [] , [] , [] , [] , [] , [] , []];
const player1Hand = [];
const player2Hand = [];
const wordPool = [];
const letterPool=[];


// Main game loop
let currentPlayer = inits.randomPlayer();
let gameOver = false;
inits.fillWordPool(wordPool);
inits.fillLetterPool(letterPool);
let turn = 0;

while (!gameOver) {
    turn++;
    console.log(`Turn ${turn} : It's ${currentPlayer}'s turn.`);
    
    //afficher
    funcToPlay.displayBoardAndLetters(currentPlayer === 'Player 1' ? player1Board : player2Board, currentPlayer === 'Player 1' ? player1Hand : player2Hand);
    let opponentBoard = currentPlayer === 'Player 1' ?player2Board : player1Board;
    let playerBoard = currentPlayer === 'Player 1' ?player1Board : player2Board;

    if (turn < 2) {
        // Draw 6 letters
        funcToPlay.drawLetters(currentPlayer,6);
        
    } else {
        // Ask if player wants to jarnac

        const jarnacChoice = await funcToPlay.askQuestion('Do you want to jarnac? (yes/no)');

        if (jarnacChoice.toLowerCase() === 'yes') {
            let canJarnac = false;
            while (!canJarnac){
                const jarnacLine = await funcToPlay.askQuestion('Which one of your opponent line do you want to jarnac ? (1/2/3/...)');

                if(opponentBoard[jarnacLine].length ===0) {
                    console.log('This line is empty, you can\'t jarnac it.');
                }
                else {
                    canJarnac = true;
                    console.log('Be careful you only have one chance to jarnac, check your answer before submitting it.');
                    const jarnacLetters = await funcToPlay.askQuestion('Which letters do you want to add to the selected word ? ');
                    const jarnacWord = await funcToPlay.askQuestion('Which new word do you have in mind ? ');

                    if (funcToPlay.jarnacAndSteal(opponentBoard,playerBoard, jarnacWord, jarnacLetters, jarnacLine)) {
                        console.log('Jarnac successful!');
                    } else {
                        console.log('Jarnac failed!');
                    }
                }
            }
        } else {
            // Check if opponent board has 8 filled lines
            if (isGameOver(player1Board, player2Board)) {
                gameOver = true;

            }
        }
    }

    if (gameOver) {break}

    // Ask if player wants to draw 1 letter or switch 3 letters
    const drawOrSwitchChoice = await funcToPlay.askQuestion('Do you want to draw 1 letter or switch 3 letters? (draw/switch)');

    if (drawOrSwitchChoice.toLowerCase() === 'draw') {
        // Draw 1 letter
        funcToPlay.drawLetters(currentPlayer,1);
    } else if (drawOrSwitchChoice.toLowerCase() === 'switch') {
        // Switch 3 letters
        funcToPlay.exchangeLetters(currentPlayer);
    }

    let wantToContinue = true;

    while (wantToContinue) {
        // Ask if player wants to play a word, add a letter, or stop turn
        const actionChoice = await funcToPlay.askQuestion('Do you want to play a word, add a letter, or stop turn? (play/add/stop)');

        if (actionChoice.toLowerCase() === 'play') {
            const wordToPlay = await funcToPlay.askQuestion('Which word do you want to play ?');

            if (funcToPlay.playWord(playerBoard, wordToPlay)) {
                console.log('Word played successfully!');
            } else {
                console.log('Word could not be played!');
            }
        } else if (actionChoice.toLowerCase() === 'add') {
            const lineToAdd = await funcToPlay.askQuestion('Which line do you want to add a word to ?');
            const lettersToAdd = await funcToPlay.askQuestion('Which letters do you want to add to the word ?');
            const wordToAdd = await funcToPlay.askQuestion('Which new word do you want put on the line ?');

            funcToPlay.addLetterToWord(playerBoard, lineToAdd, wordToAdd, lettersToAdd);
        } else if (actionChoice.toLowerCase() === 'stop') {
            wantToContinue = false 
        }
    }
    currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
}

const player1Score = funcToPlay.calculateScore(player1Board);
const player2Score = funcToPlay.calculateScore(player2Board);

console.log('Game over!');
console.log(`Player 1 score: ${player1Score}`);
console.log(`Player 2 score: ${player2Score}`);
console.log(`The winner is ${player1Score > player2Score ? 'Player 1' : 'Player 2'}`);



