const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

dotenv.config();
let server;

//local imports
const endpoints = require('./routes/endpoints.js');
const { verifyUser } = require('./helpers/authFunctions.js');

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: '*',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// use basic HTTP auth to secure the api
app.use(verifyUser);

//routes
app.use('/', endpoints);

const PORT = process.env.PORT || 5000;
server = app.listen(PORT, async () => {
  await MongoClient.connect(
    `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.egm3f.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
  ).then((client) => {
    const db = client.db(`${process.env.DATABASE_NAME}`);
    app.locals.collection = db;
  });
  console.log(`app is running on port ${PORT}`);
});

module.exports = server;
