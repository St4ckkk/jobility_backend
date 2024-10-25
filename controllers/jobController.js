const Job = require("../models/Job");

module.exports = {
  postJob: async (req, res) => {
    const newJob = new Job(req.body);
    try {
      const savedJob = await newJob.save();
      const { __v, createdAt, updatedAt, ...newJobInfo } = savedJob._doc;

      res.status(200).json(newJobInfo);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  
};
