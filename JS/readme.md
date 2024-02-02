# Jarnac Word Game

Welcome to the Jarnac Word Game repository! This project implements the Jarnac word game in JavaScript, offering an interactive and entertaining word gaming experience.

## Table of Contents

1. [Project Overview](#project-overview)
    - [File Structure](#file-structure)
2. [How to Run](#how-to-run)
3. [JavaScript Files](#javascript-files)
    - [checks.js](#checksjs)
    - [func_to_play.js](#func_to_playjs)
    - [inits.js](#initsjs)
    - [main.js](#mainjs)
4. [Words folder](#word-folder)


## Project Overview

### File Structure

The project is organized in the main folder named `JS` and contains the following JavaScript files:

- **checks.js:** Contains functions related to game checks.
- **func_to_play.js:** Implements various functions for playing the game.
- **inits.js:** Includes functions for initializing game elements.
- **main.js:** The main file running the game with the main loop.
- **cas_fin.js** Copy of the main file but the player board is already full to easily test winning conditions
- **package-lock.json:** Package lock file for dependency versioning.
- **package.json:** Package file specifying project details and dependencies.
- **word_repertory:** A folder containing a text file (`pli07.txt`) with almost 80,000 words.

## How to Run

To run the code, follow these steps:

1. Open a terminal.
2. Navigate to the `JS` directory.
3. Run the following command:

    ```bash
    node ./main.js
    ```

This command launches the main file (`main.js`) and initiates the Jarnac Word Game.

## JavaScript Files

### checks.js

- `isGameOver`
- `canFormWord`
- `canPlayWord`
- `isWordInPool`
- `isLettersInHand`
- `emptyIndex`

### func_to_play.js

- `drawLetters`
- `playWord`
- `addLetterToWord`
- `displayBoardAndLetters`
- `removeLettersFromHand`
- `askQuestion`
- `calculateScore`
- `exchangeLetters`
- `jarnacAndSteal`

### inits.js

- `fillWordPool`
- `randomPlayer`
- `fillLetterPool`

### main.js

The main file running the game with the main loop.

### cas_fin.js

Script to test winning condition.

## Words Folder

The `words` folder contains the `pli07.txt` file, a comprehensive text file with almost 80,000 words. This file is utilized in the game for word validation.
