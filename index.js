import startListeners from './src/listeners.js';
import { state } from './src/state.js';

window.addEventListener('load', () => {
    state.init();
    startListeners();
});
