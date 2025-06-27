import BouncingBallGame from './game.js';
import RandomNumberGame from './randomNumber.js';

const modeSelect = document.getElementById('modeSelect');
const canvas = document.getElementById('gameCanvas');
const statsButton = document.getElementById('statsButton');
const statsPopup = document.getElementById('statsPopup');
let currentGame = null;

function toggleStats() {
    if (currentGame && currentGame.toggleStats) {
        const visible = currentGame.toggleStats();
        statsPopup.style.display = visible ? 'block' : 'none';
    }
}

statsButton.addEventListener('click', toggleStats);

function start(mode) {
    if (currentGame && currentGame.destroy) {
        currentGame.destroy();
    }
    if (mode === 'random') {
        currentGame = new RandomNumberGame(canvas);
        statsButton.style.display = 'block';
        statsPopup.style.display = 'none';
    } else {
        currentGame = new BouncingBallGame(canvas);
        statsButton.style.display = 'none';
        statsPopup.style.display = 'none';
    }
}

modeSelect.addEventListener('change', () => {
    start(modeSelect.value);
});

window.addEventListener('load', () => {
    start(modeSelect.value);
});
