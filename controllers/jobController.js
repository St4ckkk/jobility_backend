const mongoose = require("mongoose");
const Job = require('../models/Job');
const Agent = require('../models/Agent');
const JobAlert = require('../models/JobAlert');
const User = require('../models/User'); // Make sure to import the User model
const { sendNotification } = require('../websocket');
const admin = require('firebase-admin');

module.exports = {
  createJob: async (req, res) => {
    const newJob = new Job(req.body);

    try {
      console.log('Creating new job:', newJob);

      await newJob.save();
      console.log('Job saved successfully:', newJob);

      // Log the query used to find matching users
      const query = {
        disability: { $in: newJob.acceptedDisabilities.map(d => d.type) }
      };
      console.log('Query to find matching users:', query);

      // Find users whose disabilities match the job requirements
      const users = await User.find(query);

      console.log('Matching users found:', users);

      // Create job alerts for matching users
      const jobAlerts = users.map(user => ({
        userId: user._id,
        jobId: newJob._id,
      }));

      await JobAlert.insertMany(jobAlerts);
      console.log('Job alerts created for users:', jobAlerts);

      // Send real-time notifications to matching users
      users.forEach(user => {
        sendNotification(user._id.toString(), {
          type: 'JOB_ALERT',
          message: `A new job that matches your disabilities has been posted: ${newJob.title}`,
          job: newJob,
        });
        console.log('Real-time notification sent to user:', user._id);

        // Send push notification
        if (user.fcmToken) {
          const message = {
            notification: {
              title: 'New Job Alert',
              body: `A new job that matches your disabilities has been posted: ${newJob.title}`,
            },
            token: user.fcmToken,
          };

          admin.messaging().send(message)
            .then(response => {
              console.log('Successfully sent push notification:', response);
            })
            .catch(error => {
              console.log('Error sending push notification:', error);
            });
        }
      });

      res.status(201).json({ status: true, message: 'Job created successfully.' });
    } catch (error) {
      console.error('Error creating job:', error);
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
      // Find the agent using uid
      const agent = await Agent.findOne({ uid: uid });
      if (!agent) {
        return res.status(404).json({ error: "Agent not found." });
      }

      const userId = agent.userId; // Get userId to match agentId in Job schema

      // Fetch jobs using userId as agentId
      const agentJobs = await Job.find(
        { agentId: userId },
        { createdAt: 0, updatedAt: 0, __v: 0 }
      ).sort({ createdAt: -1 });

      console.log('Fetched Agent Jobs:', agentJobs);

      res.status(200).json(agentJobs);
    } catch (err) {
      console.error('Error fetching agent jobs:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Job Alert Methods
  getJobAlerts: async (req, res) => {
    try {
      const jobAlerts = await JobAlert.find().populate('userId jobId');
      res.status(200).json(jobAlerts);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getJobAlertsByUser: async (req, res) => {
    const userId = req.params.userId;
    try {
      const jobAlerts = await JobAlert.find({ userId }).populate('jobId');
      res.status(200).json(jobAlerts);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  markAsNotified: async (req, res) => {
    const alertId = req.params.id;
    try {
      const jobAlert = await JobAlert.findByIdAndUpdate(alertId, { notified: true }, { new: true });
      if (!jobAlert) {
        return res.status(404).json({ status: false, message: 'Job alert not found.' });
      }
      res.status(200).json({ status: true, message: 'Job alert marked as notified.', jobAlert });
    } catch (error) {
      res.status(500).json(error);
    }
  }
};