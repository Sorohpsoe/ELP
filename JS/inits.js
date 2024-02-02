import * as fs  from 'fs';

// Fill the word pool
export function fillWordPool(wordPool) {
    try {
        const data = fs.readFileSync('words/ods6.txt', 'utf8');
        const words = data.split('\n');
        wordPool.push(...words);
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}

// Function to randomly choose a player
export function randomPlayer() {
    return Math.random() < 0.5 ? 'Player 1' : 'Player 2';
}



// Function to fill the letter pool
//There is : 14 A, 4 B, 7 C, 5 D, 19 E, 2 F, 4 G, 2 H, 11  I, 1 J, 1 K, 6 L, 5 M, 9 N, 8 O, 4 P, 1 Q, 10 R, 7 S, 9 T, 8 U, 2 V, 1 W, 1 X, 1 Y, 2 Z
export function fillLetterPool(letterPool) {
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


