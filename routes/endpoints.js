import express from 'express';
import database from '../helpers/database_connection.js';

const route = express.Router();

route.get('/order_items/:limit?', async (req, res) => {
  let collection;
  let limit = 20;

  if (parseInt(req.params.limit) && parseInt(req.params.limit) <= 100) {
    limit = parseInt(req.params.limit);
  }

  console.log(limit);

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

  return res.status(200).json({ data: collection, limit, offset });
});

export default route;
