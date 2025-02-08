import { EditorComponent } from '../components/editor.component.js';

export const request = EditorComponent.create('request-editor');
export const response = EditorComponent.create('response-editor');

export const editors = {
    request,
    response,
};
