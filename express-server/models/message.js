// Example schema for messages
import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
    sender: 
    {
        type: String,
        required: true
    },
    recipient: 
    {
        type: String,
        required: true
    },
    message: 
    {
        type: String,
        required: true
    },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
