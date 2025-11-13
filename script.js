// Seed-based random number generator
class SeededRandom {
    constructor(seed) {
        this.seed = seed || Math.floor(Math.random() * 1000000);
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    nextInt(max) {
        return Math.floor(this.next() * max);
    }
}

// Game state
let currentWord = '';
let currentGuess = '';
let guesses = [];
let maxGuesses = 6;
let gameSeed = null;
let seededRandom = null;
let gameWon = false;
let gameOver = false;

// Initialize game
function initGame(seed = null) {
    gameSeed = seed || generateSeed();
    seededRandom = new SeededRandom(gameSeed);
    currentGuess = '';
    guesses = [];
    gameWon = false;
    gameOver = false;
    
    document.getElementById('seedInput').value = gameSeed;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    
    renderBoard();
    loadPuzzleWord();
}

// Generate a random seed
function generateSeed() {
    return Math.floor(Math.random() * 1000000);
}

// Load puzzle word using seed-based selection
function loadPuzzleWord() {
    // Use seed to pick a word deterministically from Wordle answers only
    const wordIndex = seededRandom.nextInt(WORDLE_ANSWERS.length);
    currentWord = WORDLE_ANSWERS[wordIndex].toUpperCase();
    
    console.log('Puzzle word loaded:', currentWord);
}

// Validate word - check if it's in allowed guesses (includes all valid Wordle guesses)
function validateWord(word) {
    return WORDLE_ALLOWED_GUESSES.includes(word.toLowerCase());
}

// Render game board
function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    for (let i = 0; i < maxGuesses; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (guesses[i]) {
                const letter = guesses[i].word[j] || '';
                cell.textContent = letter;
                
                if (letter) {
                    cell.classList.add('filled');
                    
                    // Use the result from checkGuess which properly handles duplicate letters
                    if (guesses[i].result[j] === 'correct') {
                        cell.classList.add('correct');
                    } else if (guesses[i].result[j] === 'present') {
                        cell.classList.add('present');
                    } else {
                        cell.classList.add('absent');
                    }
                }
            } else if (i === guesses.length && currentGuess[j]) {
                cell.textContent = currentGuess[j];
                cell.classList.add('filled');
            }
            
            board.appendChild(cell);
        }
    }
    
    updateKeyboard();
}

// Update keyboard colors
function updateKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const letter = key.textContent;
        if (letter === 'ENTER' || letter === '⌫') return;
        
        key.classList.remove('correct', 'present', 'absent');
        
        // Check all guesses for this letter
        for (const guess of guesses) {
            const index = guess.word.indexOf(letter);
            if (index !== -1) {
                if (guess.word[index] === currentWord[index]) {
                    key.classList.add('correct');
                    break;
                } else if (currentWord.includes(letter)) {
                    key.classList.add('present');
                } else {
                    key.classList.add('absent');
                }
            }
        }
    });
}

// Initialize keyboard
function initKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const layout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];
    
    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyBtn = document.createElement('button');
            keyBtn.className = 'key';
            if (key === 'ENTER' || key === '⌫') {
                keyBtn.classList.add('wide');
            }
            // Use ⏎ symbol for ENTER
            if (key === 'ENTER') {
                keyBtn.textContent = '⏎';
            } else {
                keyBtn.textContent = key;
            }
            keyBtn.addEventListener('click', () => handleKeyPress(key));
            rowDiv.appendChild(keyBtn);
        });
        
        keyboard.appendChild(rowDiv);
    });
}

// Handle key press
function handleKeyPress(key) {
    if (gameOver || !currentWord) return;
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === '⌫') {
        currentGuess = currentGuess.slice(0, -1);
        renderBoard();
    } else if (currentGuess.length < 5) {
        currentGuess += key;
        renderBoard();
    }
}

// Submit guess
function submitGuess() {
    if (currentGuess.length !== 5) {
        showMessage('Word must be 5 letters', 'error');
        return;
    }
    
    // Validate word exists
    const isValid = validateWord(currentGuess);
    if (!isValid) {
        showMessage('Not a valid word!', 'error');
        return;
    }
    
    const result = checkGuess(currentGuess);
    guesses.push({ word: currentGuess, result });
    currentGuess = '';
    
    if (currentWord === guesses[guesses.length - 1].word) {
        gameWon = true;
        gameOver = true;
        showMessage(`Congratulations! You won in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}!`, 'success');
    } else if (guesses.length >= maxGuesses) {
        gameOver = true;
        showMessage(`Game Over! The word was: ${currentWord}`, 'error');
    }
    
    renderBoard();
}

// Check guess and return result
function checkGuess(guess) {
    const result = [];
    const wordArray = currentWord.split('');
    const guessArray = guess.split('');
    
    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === wordArray[i]) {
            result[i] = 'correct';
            wordArray[i] = null; // Mark as used
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (result[i]) continue;
        
        const letterIndex = wordArray.indexOf(guessArray[i]);
        if (letterIndex !== -1) {
            result[i] = 'present';
            wordArray[letterIndex] = null; // Mark as used
        } else {
            result[i] = 'absent';
        }
    }
    
    return result;
}

// Show message
function showMessage(text, type = 'info') {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initKeyboard();
    initGame();
    
    // Keyboard input
    document.addEventListener('keydown', (e) => {
        if (gameOver || !currentWord) return;
        
        if (e.key === 'Enter') {
            submitGuess();
        } else if (e.key === 'Backspace') {
            currentGuess = currentGuess.slice(0, -1);
            renderBoard();
        } else if (e.key.match(/^[a-zA-Z]$/)) {
            if (currentGuess.length < 5) {
                currentGuess += e.key.toUpperCase();
                renderBoard();
            }
        }
    });
    
    // New puzzle button
    document.getElementById('newPuzzle').addEventListener('click', () => {
        initGame();
    });
    
    // Share puzzle button
    document.getElementById('sharePuzzle').addEventListener('click', () => {
        const seed = document.getElementById('seedInput').value || gameSeed;
        navigator.clipboard.writeText(seed).then(() => {
            showMessage('Seed copied to clipboard!', 'success');
        });
    });
    
    // Load seed button
    document.getElementById('loadSeed').addEventListener('click', () => {
        const seed = document.getElementById('seedInput').value;
        if (seed) {
            initGame(parseInt(seed));
        } else {
            showMessage('Please enter a seed', 'error');
        }
    });
});

