// // server.js
// // "nodemon server.js"
// import express from 'express';
// import AuthRouter  from '/home/mananchichra/chatApp/express-server/routes/auth.js';
// import mongoose from 'mongoose';
// import {Server} from 'socket.io';
// import cors from 'cors';
// import { createServer } from "http";
// const PORT = process.env.PORT || 3000;
// const MONGO_URI = 'mongodb://localhost:27017';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// const app = express();
// const server = createServer(app);
// import User from './models/User.js';
// import Message from './models/message.js';
// const io = new Server(server, {
//     // options
//   });

//   const connectDB = async () => {
//     try {
//       await mongoose.connect('mongodb://localhost:27017/yourdbname', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       });
//       console.log('MongoDB connected');
//     } catch (err) {
//       console.error('MongoDB connection error:', err.message);
//       process.exit(1);
//     }
//   };
  
//   connectDB();


//   app.get('/api/User', async (req, res) => {
//     try {
//       const docs = await User.find();
//       res.json(docs);
//     } catch (err) {
//       res.status(500).send(err);
//     }
//   });


//   const users = {};



//   const SECRET_KEY = 'your_secret_key'; // Use an environment variable in a real application
//   const corsOptions = {
//     origin: 'http://127.0.0.1:3001', // Replace '*' with specific origins if needed
//     methods: 'GET,POST,PUT,DELETE,OPTIONS', // Specify allowed methods
//     allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Specify allowed headers
//     optionsSuccessStatus: 200,
//     credentials: true,// Some legacy browsers (IE11, various SmartTVs) choke on 204
//   };
//   // Apply CORS middleware to all routes
//   app.use(cors(corsOptions));

//   app.use(express.json());
//   app.use('/api/auth', AuthRouter);

//   app.get('/socket.io/socket.io.js', (req, res) => {
//     res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
//   });

  


// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//       return res.status(401).json({ message: 'Authorization token missing' });
//   }

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {
//       if (err) {
//           return res.status(401).json({ message: 'Invalid token' });
//       }
//       req.user = decoded.user;
//       next();
//   });
// };

  
//   io.use((socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       return next(new Error('Authentication error'));
//     }
  
//     jwt.verify(token, SECRET_KEY, (err, decoded) => {
//       if (err) {
//         return next(new Error('Authentication error'));
//       }
//       socket.user = decoded.user;
//       next();
//     });
//   });

  

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.user.username}`);

//   socket.on('private_message', async ({ recipient, message }) => {
//       try {
//           const newMessage = new Message({
//               sender: socket.user.username,
//               recipient,
//               message
//           });
//           await newMessage.save();

//           const recipientSocket = io.sockets.sockets.find(sock => sock.user?.username === recipient);
//           if (recipientSocket) {
//               recipientSocket.emit('private_message', {
//                   sender: socket.user.username,
//                   message
//               });
//           }
//       } catch (err) {
//           console.error('Error sending private message:', err);
//       }
//   });

//   socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.user.username}`);
//   });
// });

// app.post('/api/send-message', authMiddleware, async (req, res) => {
//   const { recipient, message } = req.body;
//   const sender = req.user.username; // Assuming username is stored in req.user from JWT middleware

//   try {
//       const newMessage = new Message({
//           sender,
//           recipient,
//           message
//       });

//       await newMessage.save();
//       // Emit the message to recipient if online
//       const recipientSocket = io.sockets.sockets.find(sock => sock.user?.username === recipient);
//       if (recipientSocket) {
//           recipientSocket.emit('private_message', {
//               sender,
//               message
//           });
//       }

//       res.status(200).json({ message: 'Message sent successfully' });
//   } catch (err) {
//       console.error('Error sending message:', err);
//       res.status(500).json({ message: 'Server Error' });
//   }
// });
// app.get('/api/chat-history/:username', authMiddleware, async (req, res) => {
//   const { username } = req.params;
//   const currentUser = req.user.username; // Assuming username is stored in req.user from JWT middleware

//   try {
//       const messages = await Message.find({
//           $or: [
//               { sender: currentUser, recipient: username },
//               { sender: username, recipient: currentUser }
//           ]
//       }).sort({ timestamp: 1 });

//       res.json({ messages });
//   } catch (err) {
//       console.error('Error fetching chat history:', err);
//       res.status(500).json({ message: 'Server Error' });
//   }
// });

  
//   server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });

import express from 'express';
import AuthRouter from '/home/mananchichra/chatApp/express-server/routes/auth.js';
import info from '/home/mananchichra/chatApp/express-server/routes/Msg.js';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import cors from 'cors';
import { createServer } from 'http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/message.js';

const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key'; // Use an environment variable in a real application

const app = express();
const server = createServer(app);
const io = new Server(server);

const users = {}; // { username: socketId }

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

app.use(cors({
    origin: 'http://127.0.0.1:3001', // Replace '*' with specific origins if needed
    methods: 'GET,POST,PUT,DELETE,OPTIONS', // Specify allowed methods
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Specify allowed headers
    optionsSuccessStatus: 200,
    credentials: true, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json());

app.use('/api/auth', AuthRouter);
app.use('/api/messages',info)
app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
});



const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded.user;
        next();
    });
};

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded.user;
        next();
    });
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Update the user's socket ID
    users[socket.user.username] = socket.id;
    io.emit('update_user_list', Object.keys(users));

    socket.on('private_message', async ({ recipient, message }) => {
        try {
            const newMessage = new Message({
                sender: socket.user.username,
                recipient,
                message
            });
            await newMessage.save();

            const recipientSocketId = users[recipient];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('private_message', {
                    sender: socket.user.username,
                    message
                });
                io.to(users[sender]).emit('private_message', {
                  sender: socket.user.username,
                  message
              });
            }
            
        } catch (err) {
            console.error('Error sending private message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username}`);
        // Remove the user from the list
        delete users[socket.user.username];
        io.emit('update_user_list', Object.keys(users));
    });
});

app.post('/api/send-message', authMiddleware, async (req, res) => {
    const { recipient, message } = req.body;
    const sender = req.user.username; // Assuming username is stored in req.user from JWT middleware

    try {
        const newMessage = new Message({
            sender,
            recipient,
            message
        });

        await newMessage.save();
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private_message', {
                sender,
                message
            });
        }

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/chat-history/:username', authMiddleware, async (req, res) => {
    const { username } = req.params;
    const currentUser = req.user.username; // Assuming username is stored in req.user from JWT middleware

    try {
        const messages = await Message.find({
            $or: [
                { sender: currentUser, recipient: username },
                { sender: username, recipient: currentUser }
            ]
        }).sort({ timestamp: 1 });

        res.json({ messages });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
