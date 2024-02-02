// Function to draw letters from the letter pool and add them to the hand
function drawLetters(hand, numLetters) {
    for (let i = 0; i < numLetters; i++) {
        const randomIndex = Math.floor(Math.random() * letterPool.length);
        const letter = letterPool.splice(randomIndex, 1)[0];
        hand.push(letter);
    }
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


// Function to display the board and letters in hand
function displayBoardAndLetters(playerBoard, lettersInHand) {
    console.log('Board:');
    console.log(playerBoard);
    console.log('Letters in hand:');
    console.log(lettersInHand);
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