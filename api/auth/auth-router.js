const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config/secrets');

const Users = require('../users/user-model');
const { isValid } = require('../users/users-service');

router.post('/register', (req, res) => {
  const credentials = req.body;
  if (isValid(credentials)) {
    const rounds = 10;
    // hash the password
    const hash = bcryptjs.hashSync(credentials.password, rounds);

    credentials.password = hash;
    // adding the user credential to the database
    Users.add(credentials)
      .then((user) => {
        res.status(201).json([user]);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json('taken');
      });
  } else {
    res.status(400).json('username and password required');
  }
  // res.end('implement register, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', (req, res) => {
  // res.end('implement login, please!');
  const { username, password } = req.body;
  if (isValid(req.body)) {
    Users.findBy({ username: username })
      .then(([user]) => {
        const token = TokenGenerator(user);
        if (user && bcryptjs.compareSync(password, user.password)) {
          res
            .status(200)
            // the server needs to return the token to the client, attach the token as part of the response
            .json({ messgae: 'Welcome back ' + user.username, token });
          // entering existing user and correct password
        } else {
          // entering wrong password
          res.status(401).json('invalid');
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json('invalid');
      });
  } else {
    res.status(400).json(
      // missing piece of credential in the req.body
      ' username and password required'
    );
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function TokenGenerator(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
  };
  const options = {
    expiresIn: '800s',
  };
  // token's been generated
  return jwt.sign(payload, jwtSecret, options);
}
module.exports = router;
