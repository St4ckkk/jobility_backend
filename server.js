const http = require('http');
const express = require('express');
const { wss } = require('./websocket');

const app = express();
const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});