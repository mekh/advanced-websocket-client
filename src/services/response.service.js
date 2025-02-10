import { elements } from '../elements.js';
import { editors } from './editors.service.js';
import { history } from './msg-history.service.js';
import { ws } from './websocket.service.js';

class ResponseService {
    init() {
        elements.copyButton.addEventListener('click', () => {
            const content = editors.response.getValue();
            if (content) {
                editors.request.setValue(content);
            }
        });

        ws.addEventListener('message', (e) => {
            history.addReceived(e.data);
        })
    }
}

export const response = new ResponseService();
