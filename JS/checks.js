

// Function to check if the game is over
function isGameOver(playerBoard, opponentBoard) {
    const playerLinesCompleted = playerBoard.filter(line => line !== "").length;
    const opponentLinesCompleted = opponentBoard.filter(line => line !== "").length;

    return playerLinesCompleted === 8 || opponentLinesCompleted === 8;
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


function emptyIndex(board) {
    return playerBoard.findIndex((line) => line.length === 0);
}