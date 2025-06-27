import BouncingBallGame from './game.js';
import RandomNumberGame from './randomNumber.js';

const modeSelect = document.getElementById('modeSelect');
const canvas = document.getElementById('gameCanvas');
let currentGame = null;

function start(mode) {
    if (currentGame && currentGame.destroy) {
        currentGame.destroy();
    }
    if (mode === 'random') {
        currentGame = new RandomNumberGame(canvas);
    } else {
        currentGame = new BouncingBallGame(canvas);
    }
}

modeSelect.addEventListener('change', () => {
    start(modeSelect.value);
});

window.addEventListener('load', () => {
    start(modeSelect.value);
});
