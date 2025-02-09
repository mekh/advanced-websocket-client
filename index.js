import startListeners from './src/listeners.js';
import { state } from './src/services/state.service.js';
import { app } from './src/services/app.service.js';

window.addEventListener('load', () => {
    state.init();
    app.init();
    startListeners();
});
