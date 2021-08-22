import express from 'express';
import { ObjectId } from 'mongodb';
import database from '../helpers/database_connection.js';

const route = express.Router();

route.get('/order_items/:limit?', async (req, res) => {
  let collection;
  let count;
  let limit = 20;

  if (parseInt(req.params.limit) && parseInt(req.params.limit) <= 100) {
    limit = parseInt(req.params.limit);
  }

  //destructure sort query
  const { sortBy = 'price', offset = 1 } = req.query;
  console.log(sortBy);

  let sortVariable =
    sortBy === 'price' ? { price: 1 } : { seller_zip_code_prefix: 1 };

  let skipVariable = (offset - 1) * limit;

  await database
    .collection('orders')
    .aggregate([
      {
        $match: {
          seller_id: req.user.username,
        },
      },
      { $sort: { ...sortVariable } },
      { $skip: skipVariable },
      { $limit: limit },
    ])
    .toArray()
    .then((res) => {
      collection = res;
    });

  //getting all count
  await database
    .collection('orders')
    .aggregate([
      {
        $match: {
          seller_id: req.user.username,
        },
      },
    ])
    .toArray()
    .then((res) => (count = [...res].length));

  return res.status(200).json({ data: collection, limit, offset, count });
});

route.delete('/delete_order_items/:id', async (req, res) => {
  let order;

  //check if order exist
  try {
    order = await database
      .collection('orders')
      .findOne({ _id: new ObjectId(req.params.id) });
  } catch (error) {
    console.log(error);
  }

  if (!order) {
    return res.status(404).json({ message: 'order does not exist' });
  }

  //if order exist, delete one
  try {
    await database
      .collection('orders')
      .deleteOne({ _id: new ObjectId(req.params.id) });
  } catch (error) {
    return res.status(500).json({ message: 'something went wrong' });
  }
  return res.status(200).json({ message: 'order sucessfully deleted' });
});

route.put('/account', async (req, res) => {
  let newRecord;
  const { city, state } = req.body;

  if (!city) {
    return res.status(400).json({ message: 'city is required in the body' });
  }

  let checkCity = state
    ? { seller_city: city, seller_state: state }
    : { seller_city: city };

  //update record
  try {
    newRecord = await database.collection('sellers').findOneAndUpdate(
      { seller_id: req.user.username },
      { $set: { ...checkCity } },
      {
        returnNewDocument: true,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'something went wrong' });
  }
  console.log(newRecord.value);
  const { _id, seller_id, seller_zip_code_prefix, ...record } = newRecord.value;
  return res.status(200).json({
    message: 'record successfully updated',
    updated_record: record,
  });
});

export default route;
