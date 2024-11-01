const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({

    userId: { type: String, required: true },
    uid: { type: String, required: true },
    name: { type: String, required: true },
    company_name: { type: String, required: true },
    hq_address: { type: String, required: true },
    working_hrs: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
