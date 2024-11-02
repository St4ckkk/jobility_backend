const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: false,
        },
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: false,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);