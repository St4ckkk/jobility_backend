const mongoose = require('mongoose');


const ApplicationLogSchema = new mongoose.Schema({
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
    }
}, { timestamps: true });

module.exports = mongoose.model('ApplicationLog', ApplicationLogSchema);
