import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

//local imports
import database from './helpers/database_connection.js';
import endpoints from './routes/endpoints.js';
import { verifyUser } from './helpers/authFunctions.js';

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

app.use('/', endpoints);

// app.get('/', (req, res) => {
//   let result = database
//     .collection('orders')
//     .findOne({ seller_id: '3442f8959a84dea7ee197c632cb2df15' })
//     .then((res) => console.log(res));

//   return res.status(200).json({ result: 'okau' });
// });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log('app running on port 5000'));

export default server;
