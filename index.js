const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("db connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
app.use(express.json())
app.use("/api/", authRoute);





app.get("/", (req, res) => res.send("Hello"));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
