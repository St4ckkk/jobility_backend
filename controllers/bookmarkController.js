const Bookmark = require('../models/Bookmark')
const Job = require('../models/Job')

module.exports = {
    createBookmark: async (req, res) => {
        const jobId = req.body.jobId;
        const userId = req.user.id;

        try {
            const job = await Job.findById(jobId);

            if (!job) {
                return res.status(400).json({ message: 'Job not found' });
            }

            const newBookmark = new Bookmark({ job: jobId, user: userId });

            const saveBookmark = await newBookmark.save();

            return res.status(200).json({ status: true, bookmarkId: saveBookmark._id })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }
}