const Job = require("../models/Job");

module.exports = {
  postJob: async (req, res) => {
    const newJob = new Job(req.body);
    try {
      const savedJob = await newJob.save();
      const { __v, createdAt, updatedAt, ...newJobInfo } = savedJob._doc;

      res.status(201).json(newJobInfo);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateJob: async (req, res) => {
    try {
      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true });

      const { __v, createdAt, updatedAt, ...updatedJobInfo } = updatedJob._doc;

      res.status(200).json(updatedJobInfo);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteJob: async (req, res) => {
    try {
      await Job.findByIdAndDelete(req.params.id);
      res.status(200).json("Job Successfully Deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getJob: async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      res.status(200).json(job);
    } catch (err) {
      res.status(500).json(err);
    }
  },

};
