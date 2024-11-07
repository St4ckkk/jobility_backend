const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Agent = require('../models/Agent');
const Review = require('../models/Review');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: File upload only supports the following filetypes - " + filetypes);
    }
  },
}).single('resume');

module.exports = {
  updateUser: async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user.id);
      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getUser: async (req, res) => {
    try {
      const profile = await User.findById(req.user.id);
      const { password, __v, updatedAt, ...userData } = profile._doc;
      res.status(200).json(userData);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.status(200).json(allUsers);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  addSkill: async (req, res) => {
    const newSkill = new Skill({
      userId: req.user.id,
      skill: req.body.skill,
    });

    try {
      await newSkill.save();
      await User.findByIdAndUpdate(req.user.id, { $set: { skills: true } });
      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteSkills: async (req, res) => {
    const id = req.params.id;
    try {
      await Skill.findByIdAndDelete(id);
      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getSkills: async (req, res) => {
    const userId = req.user.id;
    try {
      const skills = await Skill.find({ userId: userId }, { createdAt: 0, updatedAt: 0, __v: 0 });

      if (skills.length === 0) {
        return res.status(404).json([]);
      }
      res.status(200).json(skills);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  addAgent: async (req, res) => {
    const newAgent = new Agent({
      userId: req.user.id,
      uid: req.body.uid,
      hq_address: req.body.hq_address,
      working_hrs: req.body.working_hrs,
      company: req.body.company,
    });

    try {
      await newAgent.save();
      await User.findByIdAndUpdate(req.user.id, { $set: { agent: true } });
      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateAgent: async (req, res) => {
    const id = req.params.id;

    try {
      const updatedAgent = await Agent.findByIdAndUpdate(
        id,
        {
          working_hrs: req.body.working_hrs,
          hq_address: req.body.hq_address,
          company: req.body.company,
        },
        { new: true }
      );

      if (!updatedAgent) {
        return res.status(404).json({ status: false, message: "Agent not found" });
      }

      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAgent: async (req, res) => {
    try {
      const agentData = await Agent.find({ uid: req.params.uid }, { createdAt: 0, updatedAt: 0, __v: 0 });

      const agent = agentData[0];

      res.status(200).json(agent);
    } catch (err) {
      console.error("Error fetching agent:", err);
      res.status(500).json({ status: false, message: "Server error", error: err.message });
    }
  },

  getAgents: async (req, res) => {
    try {
      const agents = await User.aggregate([
        { $match: { isAgent: true } },
        { $sample: { size: 7 } },
        {
          $project: {
            _id: 0,
            name: 1,
            profile: 1,
            uid: 1,
          },
        },
      ]);
      console.log(agents); // Log to see if `uid` shows up here
      res.status(200).json({ status: true, agents });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createReview: async (req, res) => {
    try {
      const newReview = new Review({
        reviewerId: req.user.id,
        jobId: req.body.jobId,
        agentId: req.body.agentId,
        rating: req.body.rating,
        comment: req.body.comment,
      });

      if ((!req.body.jobId && !req.body.agentId) || (req.body.jobId && req.body.agentId)) {
        return res.status(400).json({
          status: false,
          message: "Please provide either jobId or agentId, but not both",
        });
      }

      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({
          status: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const savedReview = await newReview.save();

      res.status(201).json({
        status: true,
        review: savedReview,
      });
    } catch (err) {
      console.error("Error creating review:", err);
      res.status(500).json({
        status: false,
        message: "Error creating review",
        error: err.message,
      });
    }
  },

  getReviewsForJob: async (req, res) => {
    try {
      const jobId = req.params.jobId;

      const reviews = await Review.find({ jobId })
        .populate({
          path: "reviewerId",
          select: "name profile uid",
          options: { retainNullValues: true },
        })
        .select("-__v -updatedAt")
        .sort({ createdAt: -1 });

      const transformedReviews = reviews.map((review) => {
        const reviewObj = review.toObject();

        if (!reviewObj.reviewerId) {
          reviewObj.reviewerId = {
            name: "Deleted User",
            profile: null,
            uid: null,
          };
        }

        return reviewObj;
      });

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

      res.status(200).json({
        status: true,
        data: {
          reviews: transformedReviews,
          total: reviews.length,
          averageRating: parseFloat(averageRating),
        },
      });
    } catch (err) {
      console.error("Error fetching job reviews:", err);
      res.status(500).json({
        status: false,
        message: "Error fetching reviews",
        error: err.message,
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, name, email, profileImage, skills } = req.body;

      console.log('Incoming request:', req.body);
      console.log('User ID:', id);

      // Find user by id
      const user = await User.findById(id);
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ status: false, message: "User not found" });
      }

      console.log('User found:', user);

      // Update user details
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            username,
            name,
            email,
            profile: profileImage,
          },
        },
        { new: true }
      );

      console.log('Updated user:', updatedUser);

      // Update skills if provided
      if (skills && skills.length > 0) {
        // Remove existing skills
        await Skill.deleteMany({ userId: id });

        // Add new skills
        const skillPromises = skills.map(skill => {
          const newSkill = new Skill({
            userId: id,
            skill,
          });
          return newSkill.save();
        });

        await Promise.all(skillPromises);
      }

      res.status(200).json({ status: true, user: updatedUser });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ status: false, message: "Error updating profile", error: err.message });
    }
  },

  uploadResume: async (req, res) => {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ status: false, message: err });
      }

      if (!req.file) {
        return res.status(400).json({ status: false, message: "No file uploaded" });
      }
      try {
        const userId = req.user.id;
        const resumeBase64 = req.file.buffer.toString('base64'); // Ensure proper base64 encoding

        // Save the resume as a base64 string in the user document
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: { resume: resumeBase64 } },
          { new: true }
        );
        res.status(200).json({ status: true, user: updatedUser });
      } catch (err) {
        console.error("Error uploading resume:", err);
        res.status(500).json({ status: false, message: "Error uploading resume", error: err.message });
      }
    });
  }

};