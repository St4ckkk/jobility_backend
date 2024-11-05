const User = require("../models/User");
const Skill = require("../models/Skill");
const Agent = require("../models/Agent");
const Review = require("../models/Review");
const CryptoJs = require("crypto-js");

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
      res.status(200).json({ status: true })
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

  // addSkill: async (req, res) => {
  //   const newSkill = new Skills({
  //     userId: req.user.id,
  //     skill: req.body.skill,
  //   });

  //   try {
  //     await newSkill.save();
  //     await User.findByIdAndUpdate(req.user.id, { $set: { skills: true } })
  //     res.status(200).json({ status: true });
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

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

  // Replace Skills with Skill in deleteSkills
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
    const userId = req.user.id
    try {
      const skills = await Skill.find({ userId: userId }, { createdAt: 0, updatedAt: 0, __v: 0 });

      if (skills.lenght === 0) {
        return res.status(404).json([]);
      }
      res.status(200).json(skills);
    } catch (err) {
      res.status(500).json(err);
    }
  },


  // deleteSkills: async (req, res) => {
  //   const id = req.params.id;
  //   try {
  //     await Skills.findByIdAndDelete(id)
  //     res.status(200).json({ status: true });
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },


  addAgent: async (req, res) => {
    const newAgent = new Agent({
      userId: req.user.id,
      uid: req.body.uid,
      hq_address: req.body.hq_address,
      working_hrs: req.body.working_hrs,
      company: req.body.company
    });


    try {
      await newAgent.save();
      await User.findByIdAndUpdate(req.user.id, { $set: { agent: true } })
      res.status(200).json({ status: true });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateAgent: async (req, res) => {
    const id = req.params.id;


    try {
      const updatedAgent = await Agent.findByIdAndUpdate(id, {
        working_hrs: req.body.working_hrs,
        hq_address: req.body.hq_address,
        company: req.body.company
      }, { new: true })

      if (!updatedAgent) {
        return res.status(404).json({ status: false, message: 'Agent not found' })
      }

      res.status(200).json({ status: true })
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
    // const userId = req.user.id;
    try {
      const agents = await User.aggregate([
        { $match: { isAgent: true } },
        { $sample: { size: 7 } },
        {
          $project: {
            _id: 0,
            name: 1,
            profile: 1,
            uid: 1
          }
        }
      ]);
      console.log(agents); // Log to see if `uid` shows up here
      res.status(200).json({ status: true, agents });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createReview: async (req, res) => {
    try {
      // Create a new review object with the required fields
      const newReview = new Review({
        reviewerId: req.user.id,  // Current logged in user is the reviewer
        jobId: req.body.jobId,    // If reviewing a job
        agentId: req.body.agentId, // If reviewing an agent
        rating: req.body.rating,
        comment: req.body.comment
      });

      // Validate that either jobId or agentId is provided, but not both
      if ((!req.body.jobId && !req.body.agentId) || (req.body.jobId && req.body.agentId)) {
        return res.status(400).json({
          status: false,
          message: "Please provide either jobId or agentId, but not both"
        });
      }

      // Validate rating range
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({
          status: false,
          message: "Rating must be between 1 and 5"
        });
      }

      // Save the review
      const savedReview = await newReview.save();

      res.status(201).json({
        status: true,
        review: savedReview
      });

    } catch (err) {
      console.error("Error creating review:", err);
      res.status(500).json({
        status: false,
        message: "Error creating review",
        error: err.message
      });
    }
  },

  getReviewsForJob: async (req, res) => {
    try {
      const jobId = req.params.jobId;

      // First verify if the job exists (assuming you have a Job model)
      /*
      const jobExists = await Job.findById(jobId);
      if (!jobExists) {
        return res.status(404).json({
          status: false,
          message: "Job not found"
        });
      }
      */

      // Find all reviews and handle population more carefully
      const reviews = await Review.find({ jobId })
        .populate({
          path: 'reviewerId',
          select: 'name profile uid',
          // If reviewer is deleted, still return the review but with null reviewerId
          options: { retainNullValues: true }
        })
        .select('-__v -updatedAt')
        .sort({ createdAt: -1 });

      // Transform the reviews to handle null reviewerId
      const transformedReviews = reviews.map(review => {
        const reviewObj = review.toObject();

        // If reviewerId is null, add a placeholder reviewer info
        if (!reviewObj.reviewerId) {
          reviewObj.reviewerId = {
            name: "Deleted User",
            profile: null,
            uid: null
          };
        }

        return reviewObj;
      });

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

      res.status(200).json({
        status: true,
        data: {
          reviews: transformedReviews,
          total: reviews.length,
          averageRating: parseFloat(averageRating)
        }
      });

    } catch (err) {
      console.error("Error fetching job reviews:", err);
      res.status(500).json({
        status: false,
        message: "Error fetching reviews",
        error: err.message
      });
    }
  }


}
