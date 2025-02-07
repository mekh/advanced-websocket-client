import { EditorComponent } from '../components/editor.component.js';
import { elements } from '../elements.js';

export const request = EditorComponent.create(elements.requestEditor);
export const response = EditorComponent.create(elements.responseEditor);

export const editors = {
    request,
    response,
};
