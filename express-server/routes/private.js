import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Store users and their socket ids
const users = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle user joining
    socket.on('join', (username) => {
        users[username] = socket.id;
        socket.username = username;
        console.log(`${username} connected with id: ${socket.id}`);
        io.emit('update_user_list', Object.keys(users));
    });

    // Handle private message
    socket.on('private_message', ({ recipient, message }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private_message', {
                sender: socket.username,
                message
            });
        }
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (socket.username) {
            delete users[socket.username];
            io.emit('update_user_list', Object.keys(users));
        }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
