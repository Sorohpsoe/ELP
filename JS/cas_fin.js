import * as funcToPlay from './func_to_play.js';
import * as inits from './inits.js';
import * as checks from './checks.js';

import readline from 'readline';



 
// Variables
let player1Board = ["test" , "test" , "test" , "test" , "tests" , "test" , "test" , "test" , ""];
let player2Board = ["test" , "test" , "test" , "" , "" , "" , "" , "" , ""];
let player1Hand = [];
let player2Hand = [];
let wordPool = [];
let letterPool=[];


// Main game loop
let currentPlayer = inits.randomPlayer();
let gameOver = false;

inits.fillWordPool(wordPool);
inits.fillLetterPool(letterPool);

let turn = 0;

funcToPlay.drawLetters(player1Hand, 5, letterPool);
funcToPlay.drawLetters(player2Hand, 5, letterPool);

const validJarnacLines = ["0","1","2","3","4","5","6","7"]

while (!gameOver) {
    turn++;
    console.log(`Turn ${turn} : It's ${currentPlayer}'s turn.`);


        
    
    //afficher
    let opponentBoard = currentPlayer === 'Player 1' ?player2Board : player1Board;
    let playerBoard = currentPlayer === 'Player 1' ?player1Board : player2Board;
    let playerHand = currentPlayer === 'Player 1' ?player1Hand : player2Hand;
    let opponentHand = currentPlayer === 'Player 1' ?player2Hand : player1Hand;
        
    if (turn > 1) {
        // Ask if player wants to jarnac

        const jarnacChoice = await funcToPlay.askQuestion('Do you want to jarnac? (yes/no)');

        if (jarnacChoice.toLowerCase() === 'yes') {
            let canJarnac = false;
            const validJarnacLines = ["0","1","2","3","4","5","6","7"]
            while (!canJarnac){
                const jarnacLine = await funcToPlay.askQuestion('Which one of your opponent line do you want to jarnac, jarnac a new word or stop ? (0/1/2/3/... /play/stop)');
                if (jarnacLine === 'stop') {
                    canJarnac = true;
                } else if (jarnacLine === 'play') {
                    const wordToPlay = await funcToPlay.askQuestion('Which word do you want to play ?');

                    if (funcToPlay.playWord(playerBoard, wordToPlay,wordPool,opponentHand,letterPool)) {  
                        console.log('Word played successfully!');
                    } else {
                        console.log('Word could not be played!');
                    };
                } else  {
                    if (validJarnacLines.includes(jarnacLine)) {
                        if (opponentBoard[jarnacLine] !== "") {
                            const jarnacLetters = await funcToPlay.askQuestion('Which letters do you want to add to the selected word ? ');
                            const jarnacWord = await funcToPlay.askQuestion('Which new word do you have in mind ? ');
        
                            if (funcToPlay.jarnacAndSteal(opponentBoard,playerBoard, jarnacWord, jarnacLetters, jarnacLine,letterPool)) {
                                console.log('Jarnac successful!');
                            } else {
                                console.log('Jarnac failed!');
                            }
                        } else {
                            console.log('This line is empty, you can\'t jarnac it.');
                        }
                    } else {
                        console.log('Invalid line number');
                    }
                }
            }
        } else {
            // Check if opponent board has 8 filled lines
            if (checks.isGameOver(player1Board, player2Board)) {
                gameOver = true;

            }
        }
    }

    if (gameOver) {break}


    let wantToContinue = true;
    let letterChanged = false;

    funcToPlay.drawLetters(playerHand, 1, letterPool);

    while (wantToContinue) {
        funcToPlay.displayBoardAndLetters(playerBoard, playerHand);
        // Ask if player wants to play a word, add a letter, or stop turn


        const actionChoice = await funcToPlay.askQuestion('Do you want to play a word, add a letter, stop turn, or change 3 letters? (play/add/stop/change)');

        if (actionChoice.toLowerCase() === 'play') {
            const wordToPlay = await funcToPlay.askQuestion('Which word do you want to play ?');

            if (funcToPlay.playWord(playerBoard, wordToPlay,wordPool,playerHand,letterPool)) {  
                console.log('Word played successfully!');
            } else {
                console.log('Word could not be played!');
            }
        } else if (actionChoice.toLowerCase() === 'add') {
            const lineToAdd = await funcToPlay.askQuestion('Which line do you want to add a word to ?');

            if (validJarnacLines.includes(lineToAdd)) {

            const lettersToAdd = await funcToPlay.askQuestion('Which letters do you want to add to the word ?');
            const wordToAdd = await funcToPlay.askQuestion('Which new word do you want put on the line ?');
            funcToPlay.addLetterToWord(playerBoard, lineToAdd, wordToAdd, lettersToAdd,playerHand,wordToAdd,wordPool);
            } else {
                console.log('Invalid line number');
            }


        } else if (actionChoice.toLowerCase() === 'stop') {
            wantToContinue = false 
        } else if (actionChoice.toLowerCase() === 'change') {
            if (letterChanged) {
                console.log('You can only change 3 letters once per turn');
            } else {
                const lettersToChange = await funcToPlay.askQuestion('Which letters do you want to change? (Provide exactly 3 letters)');
                if (lettersToChange.length !== 3) {
                    console.log('Please provide exactly 3 letters.');
                } else {
                    funcToPlay.removeLettersFromHand(playerHand, lettersToChange);
                    funcToPlay.drawLetters(playerHand, 3, letterPool);
                    letterChanged = true;
                }
            }
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



funcToPlay.fermer_readline();
