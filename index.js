import startListeners from './src/listeners.js';
import { options } from './src/options.js';

window.addEventListener('load', () => {
    options.init();
    startListeners();
});
