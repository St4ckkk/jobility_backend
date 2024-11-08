const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Map();

wss.on('connection', (ws, req) => {
    const userId = req.url.split('/').pop();
    clients.set(userId, ws);

    ws.on('close', () => {
        clients.delete(userId);
    });
});

function sendNotification(userId, message) {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
    }
}

module.exports = { wss, sendNotification };