# Advanced WebSocket Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Advanced WebSocket Client is an extension for Google Chrome
to help construct custom Web Socket requests
and handle responses to directly test your Web Socket services.

It has been developed to support JSON request/response format and the main feature 
is that you don't have to format your request strictly as it required by the RFC - 
you may use either a single-quoted, double-quoted or no-quoted strings as a string keys and values
as well as to use trailing commas in object literals.

Also, it supports code line/block comments in the same way as in JavaScript.

All of the following samples are valid:
```javascript
{
    // double-quoted notation with a trailing coma
    "key1": "value1",
    "key2": "value2",
    // all comment lines will be automatically removed
    // before sending
}
````
```javascript
{
    // single-quoted notation
    'key1': 'value1'
}
```
```javascript
{
    // mixed notation with a trailing comma
    key1: 'value1',
    'key2': "value2",
    "key3": 'value3',
    key4: [
        'item1',
        "item2",
    ],
}
```
## Shortcats

### Request and Response editors
    F1 - fullscreen on/off
    F2 - line wrapping on/off
    Ctrl-Alt-J - format JSON
    Ctrl-Q - fold/unfold a code block
    Ctrl-/ - comment/uncomment line/block
    
### Request editor
    Ctrl-Enter - send a request

## Extension URL
https://chrome.google.com/webstore/detail/advanced-websocket-client/lgimpnfdefcpkicbflpmainbcdnlblej

## Contributors

- Alexandr Mekh ([mekh](https://github.com/mekh))
        
## License

This software is released under the MIT License, see LICENSE.txt.
