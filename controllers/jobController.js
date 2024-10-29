const Job = require("../models/Job");

module.exports = {
  postJob: async (req, res) => {
    const newJob = new Job(req.body);
    try {
      await newJob.save();
      res.status(201).json({ status: true, message: 'Job created Successfully.' });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateJob: async (req, res) => {

    const jobId = req.params.id;
    const updated = req.body;
    try {
      const updatedJob = await Job.findByIdAndUpdate(jobId, updated, { new: true });

      if (!updatedJob) {
        res.status(404).json({ status: false, message: 'Job not found.' });
      }
      res.status(200).json({ status: true, message: 'Job updated successfully.' });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteJob: async (req, res) => {
    const jobId = req.params.id;
    try {
      await Job.findByIdAndDelete(jobId);
      res.status(200).json({ status: true, message: 'Job deleted successfully.' });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getJob: async (req, res) => {
    const jobId = req.params.id;
    try {
      const job = await Job.findById({ _id: jobId }, { createdAt: 0, updatedAt: 0, __v: 0 });
      res.status(200).json(job);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAllJobs: async (req, res) => {
    const recent = req.query.new;
    try {
      let jobs;
      if (recent) {
        jobs = await Job.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ createdAt: -1 }).limit(2);
      } else {
        jobs = await Job.find({}, { createdAt: 0, updatedAt: 0, __v: 0 });
      }

    
      res.status(200).json(jobs);
    } catch (error) {

    }
  },

  searchJobs: async (req, res) => {
    try {
      const results = await Job.aggregate(
        [
          {
            $search: {
              index: "jobsearch",
              text: {
                query: req.params.key,
                path: {
                  wildcard: "*"
                }
              }
            }
          }
        ]
      );

      res.status(200).json(results);
    } catch (err) {
      res.status(500).json(err)
    }
  }
};
