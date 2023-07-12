const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const socketIO = require('socket.io');
const port = 8000;
const activeUsers = new Map();

app.use(cors());
// const io = socketIO(server);

const io = socketIO(server, {
    cors: {
        // origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['*'],
        credentials: true,
    }
});
const messageStorage = [];

io.on('connection', socket => {
  console.log('Nice to meet you:smile:');
  console.log('A user connected',socket.id);
  socket.emit('previousMessages', messageStorage);
  socket.on('login', username => {
    activeUsers.set(socket.id, username); // Store the user with their socket id
    io.emit('userList', Array.from(activeUsers.values()));
    io.emit('userJoin', username);
  });
  
  // Listen for incoming chat messages from clients
  socket.on('chat_message', data => {
    
    // const senderId = socket.id;
    
    const newMessage = {
        username: activeUsers.get(socket.id),
        message: data,
        
      };
    // Broadcast the received message to all connected clients
    console.log('user: ' + newMessage.username);
    console.log('message', newMessage.message);
    io.emit('chat_message',  newMessage);
    messageStorage.push(newMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    io.emit('userList', Array.from(activeUsers.values()));
    io.emit('userDisconnect',username);
    console.log('User', username, 'disconnected');
    
  });
});

server.listen(port, () => {
    console.log(`Listening on port: ${port}`)
});