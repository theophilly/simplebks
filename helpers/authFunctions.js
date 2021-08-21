import database from './database_connection.js';

const verifyUser = async (req, res, next) => {
  // check for basic auth header
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf('Basic ') === -1
  ) {
    return res.status(401).json({ message: 'Missing Authorization Header' });
  }

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'ascii'
  );
  const [username, password] = credentials.split(':');
  const user = await authenticate({ username, password });
  if (!user) {
    return res
      .status(401)
      .json({ message: 'Invalid Authentication Credentials' });
  }

  // attach user to request object
  req.user = user;

  next();
};

const authenticate = async ({ username, password }) => {
  let user = null;
  // check for user
  await database
    .collection('sellers')
    .findOne({ seller_id: username, seller_zip_code_prefix: password })
    .then((u) => {
      user = u;
    })
    .catch((err) => console.log(err));

  //if user exist
  if (user) {
    const { seller_id: username, seller_zip_code_prefix: password } = user;

    return { username, password };
  }
};

export { verifyUser };
