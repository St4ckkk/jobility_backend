const mongoose = require("mongoose");
const Job = require('../models/Job');
const Agent = require('../models/Agent');
const JobAlert = require('../models/JobAlert');
const Application = require('../models/Application');
const ApplicationLogs = require('../models/ApplicationLogs');
const User = require('../models/User');
const ApplicationAlert = require('../models/ApplicationAlert');
const { sendNotification } = require('../websocket');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'tpas052202@gmail.com',
    pass: 'ailamnlsomhhtglb'
  }
});

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

      // Send real-time notifications and emails to matching users
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

        // Send email notification
        if (user.email) {
          const mailOptions = {
            from: 'tpas052202@gmail.com',
            to: user.email,
            subject: 'New Job Alert',
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #333;">New Job Alert</h1>
                <p>Dear ${user.name},</p>
                <p>A new job that matches your disabilities has been posted: <strong>${newJob.title}</strong> at <strong>${newJob.company}</strong>.</p>
                <img src="${newJob.imageUrl}" alt="${newJob.title}" style="width: 100%; max-width: 600px; height: auto;"/>
                <p>Thank you for using our service.</p>
                <p>Best regards,</p>
                <p>${newJob.company}</p>
              </div>
            `
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
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
  },

  updateApplicationStatus: async (req, res) => {
    const { userId, jobId } = req.params;
    const { status } = req.body;

    try {
      const application = await Application.findOneAndUpdate(
        { user: userId, job: jobId },
        { status: status },
        { new: true }
      );

      if (!application) {
        return res.status(404).json({ status: false, message: 'Application not found.' });
      }

      // Insert log into ApplicationLogs
      const newLog = new ApplicationLogs({
        user: userId,
        job: jobId,
        status: status
      });
      await newLog.save();
      console.log('New application log inserted:', newLog);

      // Fetch job details
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ status: false, message: 'Job not found.' });
      }

      // Send real-time notification to the user
      sendNotification(userId.toString(), {
        type: 'APPLICATION_STATUS_UPDATE',
        message: `Your application status for job ${job.title} has been updated to ${status}.`,
        application,
      });

      // Send push notification
      const user = await User.findById(userId);
      if (user && user.fcmToken) {
        const message = {
          notification: {
            title: 'Application Status Update',
            body: `Your application status for job ${job.title} has been updated to ${status}.`,
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

      // Send email notification
      if (user && user.email) {
        const mailOptions = {
          from: 'tpas052202@gmail.com',
          to: user.email,
          subject: 'Application Status Update',
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h1 style="color: #333;">Application Status Update</h1>
              <p>Dear ${user.name},</p>
              <p>Your application status for the job <strong>${job.title}</strong> at <strong>${job.company}</strong> has been updated to <strong>${status}</strong>.</p>
              <p>Thank you for using our service.</p>
              <p>Best regards,</p>
              <p>${job.company}</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      }

      // Create an application alert for the user
      const applicationAlert = new ApplicationAlert({
        userId: userId,
        jobId: jobId,
        notified: false
      });

      await applicationAlert.save();
      console.log('Application alert created for user:', applicationAlert);

      res.status(200).json({ status: true, message: 'Application status updated successfully.', application, applicationAlert });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json(error);
    }
  }
};