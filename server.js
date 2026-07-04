const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

const rooms = {};
let idCounter = 0;

wss.on('connection', (ws) => {
    const id = ++idCounter;
    let currentRoom = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'create') {
                const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
                rooms[roomCode] = { players: {} };
                rooms[roomCode].players[id] = { x: 0, y: 2, z: 40 };
                currentRoom = roomCode;
                ws.send(JSON.stringify({ type: 'init', id: id, room: roomCode }));
            } else if (data.type === 'join') {
                const roomCode = data.room.toUpperCase();
                if (rooms[roomCode]) {
                    rooms[roomCode].players[id] = { x: 0, y: 2, z: 40 };
                    currentRoom = roomCode;
                    ws.send(JSON.stringify({ type: 'init', id: id, room: roomCode }));
                }
            } else if (data.type === 'move' && currentRoom) {
                const p = rooms[currentRoom].players[id];
                if (p) { p.x = data.x; p.y = data.y; p.z = data.z; }
            }
        } catch (e) {}
    });

    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            delete rooms[currentRoom].players[id];
            if (Object.keys(rooms[currentRoom].players).length === 0) delete rooms[currentRoom];
        }
    });
});

setInterval(() => {
    for (const roomCode in rooms) {
        const state = { type: 'state', players: rooms[roomCode].players };
        const payload = JSON.stringify(state);
        for (const pid in rooms[roomCode].players) {
            // Note: In production you'd track WS objects better
        }
    }
}, 33);