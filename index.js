const express = require('express')
const app = express()
const port = 3000
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jobRouter = require('./routes/job')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user');
const bookmarkRouter = require('./routes/bookmark')
const bodyParser = require('body-parser')

dotenv.config();

const admin = require('firebase-admin');
const serviceAccount = require('./jobility-95279-firebase-adminsdk-aua55-23e39d2285.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connect to Db'))
  .catch((err) => console.log(err));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/jobs', jobRouter)
app.use('/api/', authRouter)
app.use('/api/users', userRouter)
app.use('/api/bookmarks', bookmarkRouter)



app.listen(process.env.PORT || port, () =>
  console.log(`The Hub is listening on port ${process.env.PORT}!`))
