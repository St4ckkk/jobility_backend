const Application = require('../models/Application');
const ApplicationLogs = require('../models/ApplicationLogs');
const User = require('../models/User'); // Assuming you have a User model for agents

module.exports = {
    apply: async (req, res) => {
        const newApplication = new Application({
            user: req.user.id,
            job: req.body.job
        });

        try {
            await newApplication.save();
            res.status(201).json({ status: true, message: 'Application submitted successfully.' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getApplied: async (req, res) => {
        const userId = req.user.id;
        console.log("getApplied - userId:", userId);

        try {
            const applied = await Application.find({ user: userId }, { __v: 0, createdAt: 0, updatedAt: 0 })
                .sort({ createdAt: -1 })
                .populate({
                    path: 'job',
                    select: '-createdAt -updatedAt -description -requirements -__v'
                });

            console.log("getApplied - applied:", applied);
            res.status(200).json(applied);
        } catch (err) {
            console.error("Error in getApplied:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    getAppliedLogs: async (req, res) => {
        const userId = req.user.id;
        console.log("getAppliedLogs - userId:", userId);

        try {
            const appliedLogs = await ApplicationLogs.find({ user: userId }, { __v: 0, createdAt: 0, updatedAt: 0 })
                .sort({ createdAt: -1 })
                .populate({
                    path: 'job',
                    select: '-createdAt -updatedAt -description -requirements -__v'
                });

            console.log("getAppliedLogs - appliedLogs:", appliedLogs);
            res.status(200).json(appliedLogs);
        } catch (err) {
            console.error("Error in getAppliedLogs:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    getApplicants: async (req, res) => {
        const jobId = req.params.jobId;
        console.log("getApplicants - jobId:", jobId);

        try {
            const applicants = await Application.find({ job: jobId }, { __v: 0, createdAt: 0, updatedAt: 0 })
                .populate({
                    path: 'user',
                    select: 'name email' // Adjust fields as necessary
                })

            console.log("getApplicants - applicants:", applicants);
            res.status(200).json(applicants);
        } catch (err) {
            console.error("Error in getApplicants:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
};