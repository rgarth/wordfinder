# Wordle Clone - Seed-Based Puzzles

A simple Wordle-like word guessing game that generates puzzles using seeds, allowing you to share the same puzzle with others.

## Features

- 🎮 Classic Wordle gameplay (6 guesses, 5-letter words)
- 🌱 Seed-based puzzle generation - same seed = same puzzle
- 🔗 Share puzzles with friends using seed numbers
- 📚 Uses online dictionary APIs (no hardcoded word lists)
- ⌨️ Full keyboard support (physical and on-screen)
- 🎨 Modern, clean UI

## How to Play

1. Open `index.html` in your web browser
2. Type your 5-letter word guesses
3. Press Enter or click the on-screen keyboard
4. Colors indicate:
   - 🟩 Green: Correct letter in correct position
   - 🟨 Yellow: Letter exists but in wrong position
   - ⬛ Gray: Letter not in the word

## Sharing Puzzles

- Click "Share Puzzle" to copy the current seed to clipboard
- Send the seed number to a friend
- They can enter the seed and click "Load Seed" to play the same puzzle

## Technical Details

- Fetches word lists from public GitHub repositories
- Validates words using the Free Dictionary API
- Uses a seeded random number generator for deterministic puzzle selection
- Pure HTML/CSS/JavaScript - no build process required

## Note

This project was AI-generated using Cursor.

