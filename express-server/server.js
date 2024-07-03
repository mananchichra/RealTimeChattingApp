// server.js
// "nodemon server.js"
import express from 'express';
import AuthRouter  from '/home/mananchichra/chatApp/express-server/routes/auth.js';
import mongoose from 'mongoose';
import {Server} from 'socket.io';
import cors from 'cors';
import { createServer } from "http";
const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb://localhost:27017';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const app = express();
const server = createServer(app);
import User from './models/User.js';
const io = new Server(server, {
    // options
  });

  const connectDB = async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/yourdbname', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    }
  };
  
  connectDB();


  app.get('/api/User', async (req, res) => {
    try {
      const docs = await User.find();
      res.json(docs);
    } catch (err) {
      res.status(500).send(err);
    }
  });


  const users = {};



  const SECRET_KEY = 'your_secret_key'; // Use an environment variable in a real application
  const corsOptions = {
    origin: 'http://127.0.0.1:3001', // Replace '*' with specific origins if needed
    methods: 'GET,POST,PUT,DELETE,OPTIONS', // Specify allowed methods
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Specify allowed headers
    optionsSuccessStatus: 200,
    credentials: true,// Some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  // Apply CORS middleware to all routes
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use('/api/auth', AuthRouter);

  app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
  });

  


  
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
  
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.username = decoded.username;
      next();
    });
  });

  // io.on('connection', (socket) => {
  //   console.log('A user connected:', socket.user);
    
  //   socket.on('disconnect', () => {
  //     console.log('User disconnected');
  //   });
  
  //   socket.on('message', (msg) => {
  //     console.log('Message received:', msg);
  //     io.emit('message', msg); // Broadcast message to all clients
  //   });
  // });
  io.on('connection', (socket) => {
    console.log('New client connected');
    users[socket.username] = socket.id;
    io.emit('update_user_list', Object.keys(users));

    socket.on('private_message', ({ recipient, message }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private_message', {
                sender: socket.username,
                message
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (socket.username) {
            delete users[socket.username];
            io.emit('update_user_list', Object.keys(users));
        }
    });
});

  
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });