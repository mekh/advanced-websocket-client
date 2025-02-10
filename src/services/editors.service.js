import { EditorComponent } from '../components/editor.component.js';

const request = EditorComponent.create('request-editor');
const response = EditorComponent.create('response-editor');

export const editors = {
    request,
    response,
};
