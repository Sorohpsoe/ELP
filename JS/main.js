const fs = require('fs');
const readline = require('readline');
 
// Variables
const player1Board = Array.from({ length: 9 }, () => []);
const player2Board = Array.from({ length: 9 }, () => []);
const player1Hand = [];
const player2Hand = [];
const wordPool = [];
const letterPool=[];

 // Créer une interface de lecture pour lire l'entrée utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout})

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

// Function to draw letters from the letter pool and add them to the hand
function drawLetters(hand, numLetters) {
    for (let i = 0; i < numLetters; i++) {
        const randomIndex = Math.floor(Math.random() * letterPool.length);
        const letter = letterPool.splice(randomIndex, 1)[0];
        hand.push(letter);
    }
}

// Function to display the board and letters in hand
function displayBoardAndLetters(playerBoard, lettersInHand) {
    console.log('Board:');
    console.log(playerBoard);
    console.log('Letters in hand:');
    console.log(lettersInHand);
}

function emptyIndex(board) {
    return playerBoard.findIndex((line) => line.length === 0);
}

// Function to check if a word can be played in the first empty line
function canPlayWord(playerBoard, word) {
    let emptyLineIndex = emptyIndex(playerBoard)
    if (emptyLineIndex === -1) {
        return false; // No empty line available
    }
    return true;
}
// Function to check if a word is in the word pool
function isWordInPool(word) {
    return wordPool.includes(word);
}

// Function to play a word in the first empty line
function playWord(playerBoard, word) {
    let emptyLineIndex = emptyIndex(playerBoard)
    if (emptyLineIndex === -1) {
        return false; // No empty line available
    }
    // Play the word in the empty line

    return true;
}

// Function to add a letter to an existing word
function addLetterToWord(playerBoard, lineIndex, word, letters) {
    const existingWord = playerBoard[lineIndex];
    
    if (canFormWord(updatedWord, playerBoard[lineIndex], letters) && isWordInPool(word)) {
        playerBoard[lineIndex] = updatedWord;
    }
}

// Function to check if a word can be formed with the letters in the playerBoard at index lineIndex and the added letters
function canFormWord(word, existingLetters, addedLetters) {
    const allLetters = existingLetters.concat(addedLetters);
    const wordLetters = word.split('');
    
    if (wordLetters.length > allLetters.length) {
        return false; // Not enough letters to form the word
    }
    
    for (let i = 0; i < wordLetters.length; i++) {
        const letter = wordLetters[i];
        const letterIndex = allLetters.indexOf(letter);
        
        if (letterIndex === -1) {
            return false; // Letter not found in the given letters
        }
        
        allLetters.splice(letterIndex, 1);
    }
    
    return true;
}

// Fonction pour échanger 3 lettres de la main du joueur
function exchangeLetters(lettersInHand) {
/// A changer pour faire des whiles piur les vérifications
    if (lettersInHand.length < 3) {
        console.log("Vous n'avez pas suffisamment de lettres pour effectuer un échange.");
        return lettersInHand;
    }

    // Demander au joueur les 3 lettres à échanger
    rl.question("Entrez les 3 lettres que vous souhaitez échanger, séparées par des espaces : ", (input) => {
    // Convertir les lettres entrées en majuscules et les séparer en tableau
    const lettersToExchange = input.trim().toUpperCase().split(' ');

    // Vérifier que le joueur a entré exactement 3 lettres
    if (lettersToExchange.length !== 3) {
        console.log("Veuillez entrer exactement 3 lettres.");
        rl.close();
        return;
    }

    // Supprimer les premières occurrences des lettres à échanger de la main du joueur
    for (const letter of lettersToExchange) {
        const index = lettersInHand.indexOf(letter);
        if (index !== -1) {
            lettersInHand.splice(index, 1);
        } else {
            console.log(`Lettre '${letter}' introuvable dans votre main.`);
        }
    }


    // Fermer l'interface de lecture
    rl.close();
    drawLetters(lettersInHand,3)
       
    // Afficher la nouvelle main du joueur
    console.log("Votre nouvelle main après l'échange :", lettersInHand);

});
}



// Function to steal the opponent's word and place it on the player's board
function jarnacAndSteal(opponentBoard, playerBoard, word, letters, lineIndex) {
    const existingWord = playerBoard[lineIndex];

    if (canFormWord(existingWord, opponentBoard[lineIndex], letters) && isWordInPool(word)) {
        let emptyLineIndex = emptyIndex(playerBoard);
        playerBoard[emptyLineIndex] = existingWord;
        opponentBoard[lineIndex] = "";
        return true;
    }
    return false;
}

// Function to check if the game is over
function isGameOver(playerBoard, opponentBoard) {
    const playerLinesCompleted = playerBoard.filter(line => line !== "").length;
    const opponentLinesCompleted = opponentBoard.filter(line => line !== "").length;

    return playerLinesCompleted === 8 || opponentLinesCompleted === 8;
}

// Function to calculate the score of a player
function calculateScore(playerBoard) {
       let playerScore = 0;

       // Parcourir chaque mot dans le tableau du joueur
       for (const word of playerBoard) {
           // Calculer le score du mot (nombre de lettres au carré)
           const wordScore = Math.pow(word.length, 2);
   
           playerScore += wordScore;
       }
   
       return playerScore;
   }


// Main game loop
function playGame() {
    let currentPlayer = randomPlayer();
    let gameOver = false;
    fillWordPool();
    fillLetterPool();
    let turn = 0;

    while (!gameOver) {
        turn++;
        console.log(`Turn ${turn} : It's ${currentPlayer}'s turn.`);
        
        //afficher
        displayBoardAndLetters(currentPlayer === 'Player 1' ? player1Board : player2Board, currentPlayer === 'Player 1' ? player1Hand : player2Hand);
        let opponentBoard = currentPlayer === 'Player 1' ?player2Board : player1Board;
        let playerBoard = currentPlayer === 'Player 1' ?player1Board : player2Board;

        if (turn < 2) {
            // Draw 6 letters
            drawLetters(currentPlayer,6);
            
        } else {
            // Ask if player wants to jarnac

            rl.question('Do you want to jarnac? (yes/no)',(jarnacChoice)=>{

                if (jarnacChoice.toLowerCase() === 'yes') {
                    let canJarnac = false;
                    while (!canJarnac){

                        rl.question('Which one of your opponent line do you want to jarnac ? (1/2/3/...)',(jarnacLine)=>{
    

                            if(opponentBoard[jarnacLine].length ===0) {
                                console.log('This line is empty, you can\'t jarnac it.');
                            }
                            else {
                                canJarnac = true;
                                console.log('Be careful you only have one chance to jarnac, check your answer before submitting it.');
                                rl.question('Which letters do you want to add to the selected word ? ',(jarnacLetters)=>{
                                    rl.question('Which new word do you have in mind ? ',(jarnacWord)=>{
                                        if (jarnacAndSteal(opponentBoard,playerBoard, jarnacWord, jarnacLetters, jarnacLine)) {
                                            console.log('Jarnac successful!');
                                        } else {
                                            console.log('Jarnac failed!');
                                        }
                                    })
                                })
                            }
                        })
                    }
                } else {
                    // Check if opponent board has 8 filled lines
                    if (isGameOver(player1Board, player2Board)) {
                        gameOver = true;

                    }
                }
            })
        }

        if (gameOver) {break}

        // Ask if player wants to draw 1 letter or switch 3 letters
        rl.question('Do you want to draw 1 letter or switch 3 letters? (draw/switch)',(drawOrSwitchChoice)=>{
 
            if (drawOrSwitchChoice.toLowerCase() === 'draw') {
                // Draw 1 letter
                drawLetters(currentPlayer,1);
            } else if (drawOrSwitchChoice.toLowerCase() === 'switch') {
                // Switch 3 letters
                exchangeLetters(currentPlayer);
            }
        })

        let wantToContinue = true;

        while (wantToContinue) {
            // Ask if player wants to play a word, add a letter, or stop turn
            rl.question('Do you want to play a word, add a letter, or stop turn? (play/add/stop)',(actionChoice)=>{
                if (actionChoice.toLowerCase() === 'play') {
                    rl.question('Which word do you want to play ?',(wordToPlay)=>{
                        if (playWord(playerBoard, wordToPlay)) {
                            console.log('Word played successfully!');
                        } else {
                            console.log('Word could not be played!');
                        }
                    })
                } else if (actionChoice.toLowerCase() === 'add') {
                    rl.question('Which line do you want to add a word to ?',(lineToAdd)=>{
                        rl.question('Which letters do you want to add to the word ?',(lettersToAdd)=>{
                            rl.question('Which new word do you want put on the line ?',(wordToAdd)=>{
                                addLetterToWord(playerBoard, lineToAdd, wordToAdd, lettersToAdd);
                            })
                        })
                    })
                } else if (actionChoice.toLowerCase() === 'stop') {
                    wantToContinue = false 
                }
            })
        }
        currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
    }

    const player1Score = calculateScore(player1Board);
    const player2Score = calculateScore(player2Board);

    console.log('Game over!');
    console.log(`Player 1 score: ${player1Score}`);
    console.log(`Player 2 score: ${player2Score}`);
    console.log(`The winner is ${player1Score > player2Score ? 'Player 1' : 'Player 2'}`);
}


// Start the game
//playGame();

