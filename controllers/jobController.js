const mongoose = require("mongoose");
const Job = require('../models/Job');
const Agent = require('../models/Agent');


module.exports = {
  createJob: async (req, res) => {
    const newJob = new Job(req.body);

    try {
      await newJob.save();

      res.status(201).json({ status: true, message: 'Job created successfully.' });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  updateJob: async (req, res) => {
    const jobId = req.params.id;
    const updated = req.body;

    try {
      const updatedJob = await Job.findByIdAndUpdate(jobId, updated, { new: true });

      if (!updatedJob) {
        return res.status(404).json({ status: false, message: 'Job not found.' });
      }

      res.status(200).json({ status: true, message: 'Job updated successfully.' });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  deleteJob: async (req, res) => {
    const jobId = req.params.id;

    try {
      await Job.findByIdAndDelete(jobId);
      res.status(200).json({ status: true, message: 'Job deleted successfully.' });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getJob: async (req, res) => {
    const jobId = req.params.id;

    try {
      const job = await Job.findById({ _id: jobId }, { createdAt: 0, updatedAt: 0, __V: 0 });

      res.status(200).json(job);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getAllJobs: async (req, res) => {
    const recent = req.query.new;
    try {
      let jobs;

      if (recent) {
        jobs = await Job.find({}, { createdAt: 0, updatedAt: 0, __V: 0 }).sort({ createdAt: -1 }).limit(2)
      } else {
        jobs = await Job.find({}, { createdAt: 0, updatedAt: 0, __V: 0 })
      }

      res.status(200).json(jobs)
    } catch (error) {
      res.status(500).json(error);
    }
  },

  searchJobs: async (req, res) => {
    try {
      const results = await Job.aggregate([
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
      ])
      res.status(200).json(results)
    } catch (error) {
      res.status(500).json(error);
    }
  },


  getAgentJobs: async (req, res) => {
    const uid = req.params.uid;

    try {
      // First, find the agentId based on uid
      const agent = await Agent.findOne({ uid: uid });
      if (!agent) {
        return res.status(404).json({ error: "Agent not found." });
      }

      const agentId = agent._id;

      // Now use agentId to fetch jobs
      const agentJobs = await Job.find(
        { agentId: agentId },
        { createdAt: 0, updatedAt: 0, __v: 0 }
      ).sort({ createdAt: -1 });

      console.log('Agent Jobs:', agentJobs);

      if (!agentJobs.length) {
        console.log(`No jobs found for agent ${agentId}`);
      }

      res.status(200).json(agentJobs);
    } catch (err) {
      console.error('Error fetching agent jobs:', err);
      res.status(500).json({ error: err.message });
    }
  },
  getAgentJobs: async (req, res) => {
    const uid = req.params.uid;

    try {
      // First, find the agentId based on uid
      const agent = await Agent.findOne({ uid: uid });
      if (!agent) {
        return res.status(404).json({ error: "Agent not found." });
      }

      const agentId = agent._id;

      // Now use agentId to fetch jobs
      const agentJobs = await Job.find(
        { agentId: agentId },
        { createdAt: 0, updatedAt: 0, __v: 0 }
      ).sort({ createdAt: -1 });

      console.log('Agent Jobs:', agentJobs);

      if (!agentJobs.length) {
        console.log(`No jobs found for agent ${agentId}`);
      }

      res.status(200).json(agentJobs);
    } catch (err) {
      console.error('Error fetching agent jobs:', err);
      res.status(500).json({ error: err.message });
    }
  }

};