const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  fieldOfStudy: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

const ExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    updated: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAgent: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: Array,
      default: [],
    },
    profile: {
      type: String,
      required: true,
      default: "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Jollibee_2011_logo.svg/800px-Jollibee_2011_logo.svg.png",
    },
    disability: {
      type: String,
      required: false,
    },
    pwdIdImage: {
      type: String,
      required: false,
    },
    resume: {
      type: String,
      required: false,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    education: [EducationSchema], // New field for education
    experience: [ExperienceSchema], // New field for experience
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);