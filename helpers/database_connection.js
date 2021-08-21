import { MongoClient } from 'mongodb';

let database;

async function connectdb() {
  // Use connect method to connect to the server
  const url =
    'mongodb+srv://theodasa:36251480@cluster0.egm3f.mongodb.net/simplebks?retryWrites=true&w=majority';
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log('Connected successfully to server');
  database = await client.db('simplebks');

  return 'done.';
}

//initiate the connection
await connectdb().then(console.log).catch(console.error);

export default database;
