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

// Dictionary API - using Free Dictionary API
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

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

// Curated list of common 5-letter words (always available, works offline)
const FALLBACK_WORDS = [
                'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
                'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien', 'align', 'alike', 'alive',
                'allow', 'alone', 'along', 'alter', 'among', 'angel', 'anger', 'angle', 'angry', 'apart',
                'apple', 'apply', 'arena', 'argue', 'arise', 'array', 'arrow', 'aside', 'asset', 'avoid',
                'awake', 'award', 'aware', 'badly', 'baker', 'bases', 'basic', 'beach', 'began', 'begin',
                'being', 'below', 'bench', 'billy', 'birth', 'black', 'blame', 'blank', 'blast', 'blend',
                'bless', 'blind', 'block', 'blood', 'bloom', 'blown', 'blues', 'board', 'boost', 'booth',
                'bound', 'brain', 'brand', 'brass', 'brave', 'bread', 'break', 'breed', 'brief', 'bring',
                'broad', 'broke', 'brown', 'brush', 'buddy', 'build', 'built', 'bunch', 'burns', 'burst',
                'cabin', 'cable', 'cache', 'calif', 'calls', 'calm', 'came', 'camp', 'canal', 'candy',
                'cargo', 'carol', 'carry', 'catch', 'cater', 'cause', 'chain', 'chair', 'chaos', 'charm',
                'chart', 'chase', 'cheap', 'check', 'cheek', 'cheer', 'chest', 'chief', 'child', 'chill',
                'china', 'chose', 'chuck', 'chunk', 'civic', 'civil', 'claim', 'clash', 'class', 'clean',
                'clear', 'click', 'cliff', 'climb', 'clock', 'close', 'cloth', 'cloud', 'coach', 'coast',
                'could', 'count', 'court', 'cover', 'crack', 'craft', 'crash', 'crazy', 'cream', 'creek',
                'crime', 'crisp', 'crowd', 'crown', 'crude', 'curve', 'cycle', 'daily', 'dance', 'dated',
                'dealt', 'death', 'debut', 'delay', 'delta', 'dense', 'depth', 'doing', 'doubt', 'dozen',
                'draft', 'drama', 'drank', 'drawn', 'dream', 'dress', 'drill', 'drink', 'drive', 'drove',
                'dying', 'eager', 'early', 'earth', 'eight', 'elbow', 'elder', 'elect', 'elite', 'empty',
                'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist',
                'extra', 'faith', 'false', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final',
                'first', 'fixed', 'flash', 'fleet', 'flesh', 'float', 'flood', 'floor', 'flour', 'fluid',
                'focus', 'force', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh',
                'front', 'frost', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'glory',
                'going', 'grace', 'grade', 'grain', 'grand', 'grant', 'grass', 'grave', 'great', 'green',
                'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'guilt', 'habit', 'happy',
                'harry', 'harsh', 'haste', 'hasty', 'haven', 'heart', 'heavy', 'hence', 'henry', 'hobby',
                'honey', 'honor', 'horse', 'hotel', 'house', 'human', 'humor', 'hurry', 'ideal', 'image',
                'imply', 'inbox', 'index', 'inner', 'input', 'issue', 'japan', 'jimmy', 'joint', 'jones',
                'judge', 'known', 'label', 'large', 'laser', 'later', 'later', 'laugh', 'layer', 'learn',
                'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'light', 'limit', 'links', 'lives',
                'local', 'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march',
                'maria', 'marry', 'match', 'maybe', 'mayor', 'meant', 'media', 'metal', 'meter', 'might',
                'minor', 'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse',
                'mouth', 'moved', 'movie', 'music', 'needs', 'never', 'newly', 'night', 'noble', 'noise',
                'north', 'noted', 'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'order', 'organ',
                'other', 'ought', 'outer', 'owner', 'paint', 'panel', 'paper', 'party', 'peace', 'peter',
                'phase', 'phone', 'photo', 'piano', 'piece', 'pilot', 'pitch', 'place', 'plain', 'plane',
                'plant', 'plate', 'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print',
                'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet', 'quite', 'radio',
                'raise', 'range', 'rapid', 'ratio', 'reach', 'ready', 'realm', 'rebel', 'refer', 'relax',
                'reply', 'rider', 'ridge', 'right', 'rigid', 'risky', 'rival', 'river', 'robin', 'roger',
                'roman', 'rough', 'round', 'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score',
                'sense', 'serve', 'seven', 'shall', 'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell',
                'shift', 'shine', 'shirt', 'shock', 'shoot', 'shore', 'short', 'shown', 'sight', 'since',
                'sixth', 'sixty', 'sized', 'skill', 'sleep', 'slide', 'small', 'smart', 'smile', 'smith',
                'smoke', 'snake', 'snow', 'solar', 'solid', 'solve', 'sorry', 'sound', 'south', 'space',
                'spare', 'speak', 'speed', 'spend', 'spent', 'split', 'spoke', 'sport', 'staff', 'stage',
                'stake', 'stand', 'start', 'state', 'steam', 'steel', 'stick', 'still', 'stock', 'stone',
                'stood', 'store', 'storm', 'story', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar',
                'suite', 'super', 'sweet', 'table', 'taken', 'taste', 'taxes', 'teach', 'teams', 'teeth',
                'terry', 'texas', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thing',
                'think', 'third', 'those', 'three', 'threw', 'throw', 'thumb', 'tiger', 'tight', 'times',
                'tired', 'title', 'today', 'token', 'total', 'touch', 'tough', 'tower', 'track', 'trade',
                'train', 'treat', 'trend', 'trial', 'tribe', 'trick', 'tried', 'tries', 'truck', 'truly',
                'trunk', 'trust', 'truth', 'twice', 'uncle', 'under', 'undue', 'union', 'unity', 'until',
                'upper', 'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'video', 'virus', 'visit',
                'vital', 'vocal', 'voice', 'waste', 'watch', 'water', 'wheel', 'where', 'which', 'while',
                'white', 'whole', 'whose', 'woman', 'women', 'world', 'worry', 'worse', 'worst', 'worth',
                'would', 'write', 'wrong', 'wrote', 'young', 'yours', 'youth', 'yummy', 'zebra', 'zones'
];

// Load puzzle word using seed-based selection
function loadPuzzleWord() {
    // Start with fallback words immediately (works offline, no network delay)
    let allWords = FALLBACK_WORDS;
    
    // Try to fetch a larger word list in the background (non-blocking)
    // This improves variety but doesn't block gameplay
    fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt')
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Response not ok');
        })
        .then(text => {
            const fetchedWords = text.split('\n')
                .filter(word => word.length === 5 && /^[a-z]+$/.test(word.toLowerCase()))
                .map(word => word.toLowerCase());
            
            if (fetchedWords.length > 0) {
                // Store for future use, but don't change current game
                console.log(`Loaded ${fetchedWords.length} words from API`);
            }
        })
        .catch(error => {
            // Silently fail - we have fallback words
            console.log('Could not fetch word list, using fallback:', error.message);
        });
    
    // Use seed to pick a word deterministically from the list
    const wordIndex = seededRandom.nextInt(allWords.length);
    currentWord = allWords[wordIndex].toUpperCase();
    
    console.log('Puzzle word loaded:', currentWord);
    showMessage('', '');
}

// Validate word using dictionary API
async function validateWord(word) {
    try {
        const response = await fetch(`${DICTIONARY_API}${word.toLowerCase()}`);
        return response.ok;
    } catch (error) {
        return false;
    }
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
                    
                    if (guesses[i].word[j] === currentWord[j]) {
                        cell.classList.add('correct');
                    } else if (currentWord.includes(guesses[i].word[j])) {
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
            keyBtn.textContent = key;
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
async function submitGuess() {
    if (currentGuess.length !== 5) {
        showMessage('Word must be 5 letters', 'error');
        return;
    }
    
    // Validate word exists
    const isValid = await validateWord(currentGuess);
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

