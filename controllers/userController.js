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
    // const id = req.user.id;
    try {
      const agentData = await Agent.find({ uid: req.params.uid }, { createdt: 0, updatedAt: 0, __v: 0 });

      const agent = agentData[0];
      console.log(agent);
      res.status(200).json(agent);
    } catch (err) {
      res.status(500).json(err);
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
    const { job, agent, rating, comment } = req.body;

    if (!job && !agent) {
      return res.status(400).json({ status: false, message: 'Job or Agent is required' });
    }

    const newReview = new Review({
      reviewer: req.user.id,
      job: job || null,
      agent: agent || null,
      rating,
      comment
    });

    try {
      await newReview.save();
      res.status(200).json({ status: true, review: newReview });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getReviewsForJob: async (req, res) => {
    const { jobId } = req.params;

    try {
      const reviews = await Review.find({ job: jobId })
        .populate('reviewer', 'name profile')
        .populate('job', 'title')
        .populate('agent', 'uid company');

      console.log(reviews); // Log the reviews to check if agent is null

      if (reviews.length === 0) {
        return res.status(404).json({ status: false, message: 'No reviews found for this job' });
      }

      res.status(200).json({ status: true, reviews });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}
