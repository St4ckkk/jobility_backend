const mongoose = require('mongoose');


const ApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    },
    status: {
        type: String,
        default: 'pending'
    },
    details: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
