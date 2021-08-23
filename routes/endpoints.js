const express = require('express');
const { ObjectId } = require('mongodb');

const route = express.Router();

route.get('/order_items/:limit?', async (req, res) => {
  const database = req.app.locals.collection;
  let collection;
  let count;
  let limit = 20;

  if (parseInt(req.params.limit) && parseInt(req.params.limit) <= 100) {
    limit = parseInt(req.params.limit);
  }

  //destructure sort query
  const { sortBy = 'shipping_limit_date', offset = 1 } = req.query;

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

  return res
    .status(200)
    .json({ data: collection, limit, offset, total: count });
});

route.delete('/order_items/:id', async (req, res) => {
  const database = req.app.locals.collection;
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
  const database = req.app.locals.collection;
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
    await database
      .collection('sellers')
      .findOneAndUpdate(
        { seller_id: req.user.username },
        { $set: { ...checkCity } },
        { upsert: true, returnOriginal: false, returnNewDocument: true }
      );

    await database
      .collection('sellers')
      .findOne({ seller_id: req.user.username })
      .then((doc) => (newRecord = doc));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'something went wrong' });
  }

  const { _id, seller_id, seller_zip_code_prefix, ...record } = newRecord;
  return res.status(200).json({
    message: 'record successfully updated',
    updated_record: record,
  });
});

module.exports = route;
