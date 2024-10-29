const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const jobRoute = require("./routes/job");
const bookmarkRoute = require('./routes/bookmark');
// const chatRoute = require('./routes/cha')
const bodyParser = require('body-parser')

dotenv.config();

const admin = require('firebase-admin');
const serviceAccount = require('./FIREBASE_SERVICE_ACCOUNT/jobility-c1d00-firebase-adminsdk-jm7dq-4ada377134.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
app.use("/api/bookmarks", bookmarkRoute);



app.get("/", (req, res) => res.send("Hello"));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
