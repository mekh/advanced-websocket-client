import startListeners from './src/listeners.js';
import editors from './src/editor.js';
import initResize from './src/resize.js';
import * as options from './src/options.js';

window.addEventListener('load', () => {
    initResize();
    editors.init();
    options.init();
    startListeners();
});
