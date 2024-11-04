const express = require("express");
const app = express();
const dotenv = require("dotenv");
const admin = require('firebase-admin');
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const appliedRoute = require("./routes/apply");
const jobRoute = require("./routes/job");
const bookmarkRoute = require('./routes/bookmark');

const bodyParser = require('body-parser')

dotenv.config();


// Initialize Firebase Admin with proper private key handling
const initializeFirebase = () => {
  try {
    // Method 1: If using individual environment variables
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const serviceAccountConfig = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };
  
    // Method 2: If using a single JSON environment variable
    // Uncomment this if you're using FIREBASE_SERVICE_ACCOUNT
    /*
    const serviceAccountConfig = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );
    */

    // console.log('Initializing Firebase with project:', serviceAccountConfig.project_id);
    // console.log('Using client email:', serviceAccountConfig.client_email);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountConfig)
    });

    // console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    // Rethrow the error to prevent the server from starting with invalid credentials
    throw error;
  }
};

// Initialize Firebase
initializeFirebase();


mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("db connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/", authRoute);
app.use("/api/users", userRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/applied", appliedRoute);
app.use("/api/bookmarks", bookmarkRoute);




app.get("/", (req, res) => res.send("Hello"));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
