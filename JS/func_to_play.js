import * as checks from './checks.js';

import readline from 'readline';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// Function to draw letters from the letter pool and add them to the hand
export function drawLetters(hand, numLetters,letterPool) {
    for (let i = 0; i < numLetters; i++) {
        const randomIndex = Math.floor(Math.random() * letterPool.length);
        const letter = letterPool.splice(randomIndex, 1)[0];
        hand.push(letter);
    }
}

// Function to play a word in the first empty line
export function playWord(playerBoard, word,wordPool,playerHand,letterPool) {
    let canPlay = checks.isWordInPool(word,wordPool)
    let haveLetters = checks.isLettersInHand(word,playerHand)
    let emptyLineIndex = checks.emptyIndex(playerBoard)
    if (emptyLineIndex === -1 || !canPlay || !haveLetters || word.length<3) { 
        return false; // No empty line available
    }
    // Play the word in the empty line
    removeLettersFromHand(playerHand,word)
    drawLetters(playerHand,1,letterPool)
    playerBoard[emptyLineIndex] = word;

    return true;
}



// Function to add a letter to an existing word
export function addLetterToWord(playerBoard, lineIndex, word, letters,playerHand,updatedWord,wordPool) {
    
    
    if (checks.canFormWord(updatedWord, playerBoard[lineIndex], letters) && checks.isWordInPool(word,wordPool)) {
        playerBoard[lineIndex] = updatedWord;
        removeLettersFromHand(playerHand, letters);
    }
}


// Function to display the board and letters in hand
export function displayBoardAndLetters(playerBoard, lettersInHand) {
    console.log('Board:');
    console.log(playerBoard);
    console.log('Letters in hand:');
    console.log(lettersInHand);
}

// Function to remove letters of a word from a player's hand
export function removeLettersFromHand(lettersInHand, word) {
    for (const letter of word) {
        const uppercaseLetter = letter.toUpperCase();
        const index = lettersInHand.indexOf(uppercaseLetter);
        if (index !== -1) {
            lettersInHand.splice(index, 1);
        }
    }
}

export function askQuestion(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
    
}

// Function to calculate the score of a player
export function calculateScore(playerBoard) {
       let playerScore = 0;

       // Parcourir chaque mot dans le tableau du joueur
       for (const word of playerBoard) {
           // Calculer le score du mot (nombre de lettres au carré)
           const wordScore = Math.pow(word.length, 2);
   
           playerScore += wordScore;
       }
   
       return playerScore;
   }

   
   
// Fonction pour échanger 3 lettres de la main du joueur
export async function exchangeLetters(lettersInHand,letterPool) {
    if (lettersInHand.length < 3) {
        console.log("Vous n'avez pas suffisamment de lettres pour effectuer un échange.");
        return lettersInHand;
    }

    // Demander au joueur les 3 lettres à échanger
    const input = await askQuestion("Entrez les 3 lettres que vous souhaitez échanger, séparées par des espaces : ");

    // Convertir les lettres entrées en majuscules et les séparer en tableau
    const lettersToExchange = input.trim().toUpperCase().split(' ');

    // Vérifier que le joueur a entré exactement 3 lettres
    if (lettersToExchange.length !== 3) {
        console.log("Veuillez entrer exactement 3 lettres.");
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

    drawLetters(lettersInHand, 3,letterPool);

    // Afficher la nouvelle main du joueur
    console.log("Votre nouvelle main après l'échange :", lettersInHand);
}



// Function to steal the opponent's word and place it on the player's board
export function jarnacAndSteal(opponentBoard, playerBoard, word, letters, lineIndex,letterPool) {
    const existingWord = playerBoard[lineIndex];

    if (checks.canFormWord(existingWord, opponentBoard[lineIndex], letters) && checks.isWordInPool(word,letterPool)) {
        let emptyLineIndex = checks.emptyIndex(playerBoard);
        playerBoard[emptyLineIndex] = existingWord;
        opponentBoard[lineIndex] = "";
        return true;
    }
    return false;
}

export function fermer_readline () {
    rl.close()
}