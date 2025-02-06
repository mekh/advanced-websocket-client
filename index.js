import startListeners from './src/listeners.js';
import { state } from './src/services/state.service.js';

window.addEventListener('load', () => {
    state.init();
    startListeners();
});
