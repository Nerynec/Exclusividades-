require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const port = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.emit('socket:connected', { ok: true, at: new Date().toISOString() });
});

server.listen(port, () => {
  console.log(`Backend + WebSocket escuchando en puerto ${port}`);
});
