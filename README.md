FIREBASE_TYPE=service_account

FIREBASE_PROJECT_ID=jobility-95279

FIREBASE_PRIVATE_KEY_ID=23e39d2285122c3db92d070243c03e71ca99f5ba

FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDhG1gTpSj8xvQp\nUuX8k32s1Dh3ConqG5PoMcmSPImM+TSEtplSP3V5KOxW70e0R4WitR7Del4HJRsn\nyGXV8+kEKsVEwb91L71LkSzQs9SKLz53EEks/mwcyMUft1Md01mgSRMU+8McX7SU\nB8RmotJlWUOLA//vqqjlT7uDJXDAsaEMLE2xM62DmqlZssMP1z0TB9ZOSWprfNHU\ns6Bg86g+FsFZNBQxWeqO3V34G0yxrAYNwcYHBpWYd0yOvcC1NDsyn9qs8LmyjqlH\nmYjoLT8BfglUbRat4sN435Lf9XSo4Td+6FuwGmwtLWmRTQeBG0zNom+/msIUz7TP\n/xqWNX/PAgMBAAECggEASjA32+mf04dCaugeUhrN3YrnvRvlDhneqjTWaPK4ppRv\nIZoId9ngPnklQxWDPUAhI9mrdOM8YABzra3XGidT0YLDFwD/t4BvU5tZ+MJ7trsR\nTC4637BOM0Jb7TL/GqJQNIpA1raOvCgynGLe8LCSxMIhh4xe6j8FgOXBN9y8B1Ul\nLW5lTJJ6IK6jSxBSmTsklNhHAxTeX11buGmf8QVGmfCc1RWk7zCgB3GxscwNyUtu\nE/ZJhRkJVxxtecS5aXwDKm6gox5GS/n/8DsvCRvS4cH1guLme+2hhkQz6T+ZpCsV\n/KwWbmcvzJpzxSboE3ZdJVZqPK/jk8fdKhUCq3KsYQKBgQDzo8JzeVd51oeX3jmN\nrQXTCWkCf/ewY9L40yLNRXKMV3S7JyizqVbRXFsXtavLMZHkiKCpD6MXbPSyCmW1\nPTRsT+DvT2gFa+976YkY9WJEmCJE+4j9/7yBuH4WBXYajBqWxo+oIcPUdg2jhZDT\nTZ0iXwrhtSJB5t8IznX4NQRn/wKBgQDshuQc9Z6n6SIlE+95zaibzlMUkzZ19XYc\nZs4JwE8z+HfeL3R42rkvK7uLKd5XtGd2o6stEbfUT7veD7zV4a6cixZ+92EToyZj\n8evkp9D2t/QgW/e+SLcZg4ioZNUnIEmVSRA8DeX3/q+ZGzHM/G7njWzhIAFJP1ug\n7LV9KeJoMQKBgE9sLtNd1vpMyN7k/nYE1UU6aBT8ik3h/MBIc6ve27yMNe1ckpQe\nu8J8DOXpvxr6CckqENWL12qnhg0T/pvaW+CDGZxpkktSKDuIobyVIXei8Gj0ZnAG\nkfjnn5KmLR3yViiYifQRLblw0nlf7Ro0zuiJew6g8Y3yKPrB8wr6nXkZAoGBAOOF\ntnTtCNs4dbH5BUnDvUdzJ5QJMEA0CJO1iMj0hrvVbWj7eSywKaboiJWLhugTD9ue\nARFvk8fVk0A/H0UWvOK1IMStrmI3dLx7gJEJpQdPWLSwAxa11/vg/VoO9MOYWXAT\nQlyiee8evUeoUzV+NijjcDL2mIYfPkMEsGhgG/xhAoGAaij5OM7JNWVlUVM4pUI5\nnbIy73v9YM9AxVAoqrTJP/qbZgPKD1geuhojgN2a2kAM95GtmBquV7hhMlRpHxOB\nw6LqtiXWLB4X57nTBQR2e5Fy/Wsb8QqNA1kMUGXtCs/wYVtWCemYHzMF055ABXQJ\nR2wJHZSqDgWxKIW0J3XeIVE=\n-----END PRIVATE KEY-----\n

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-aua55@jobility-95279.iam.gserviceaccount.com

FIREBASE_CLIENT_ID=113917753301503198400

FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth

FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-aua55%40jobility-95279.iam.gserviceaccount.com

FIREBASE_UNIVERSE_DOMAIN=googleapis.com




const express = require("express");
const app = express();
const dotenv = require("dotenv");
const admin = require('firebase-admin');
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const jobRoute = require("./routes/job");
const bookmarkRoute = require('./routes/bookmark');
const bodyParser = require('body-parser')

dotenv.config();

// Initialize Firebase Admin with credentials from environment variables
const initializeFirebase = () => {
  try {
    const serviceAccountConfig = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountConfig)
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    // You might want to throw the error here depending on your error handling strategy
  }
};

// Initialize Firebase
initializeFirebase();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/", authRoute);
app.use("/api/users", userRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/bookmarks", bookmarkRoute);
app.get("/", (req, res) => res.send("Hello"));

// Server startup
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
