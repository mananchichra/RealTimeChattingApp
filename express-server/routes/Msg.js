import express from 'express';
const router = express.Router();


import Message from '../models/message.js';

router.get('/', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Server Error' });
    }
})

export default router;