const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const engagementLogSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    session_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Session',  
        required: true 
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expression_type: { 
        type: String, 
        required: true,
        enum: ['happy', 'sad', 'confused', 'engaged', 'bored'] 
    },
    popup_message: { 
        type: String, 
        required: true,
        maxlength: 200  
    },
    confidence_score: { 
        type: Number,  
        min: 0,
        max: 1 
    },
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true  
    }
}, { 
    timestamps: true  
});

engagementLogSchema.index({ session_id: 1, user_id: 1, timestamp: 1 });

module.exports = mongoose.model('EngagementLog', engagementLogSchema);
