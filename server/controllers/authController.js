const jwt = require("jwt-simple");
const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const axios = require("axios");

/* import from utils/validation */

const {
  validateUsername,
  validateFullName,
  validatePassword,
  validateEmail,
} = require("../utils/validation");

module.exports.verifyJwt = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const id = jwt.decode(token, process.env.JWT_SECRET).id;
      const user = await User.findOne(
        { _id: id },
        "email username bookmarks bio fullName confirmed website"
      );
      if (user) {
        return resolve(user);
      } else {
        reject("Not authorized.");
      }
    } catch (err) {
      return reject("Not Authorized");
    }
  });
};

module.exports.requireAuth = async (req, res, next) => {
  
  const {authorization} = req.headers;
  
  if(!authorization){
    return res.status(401).send({ error: 'Not authorized'});
  }
    try {
      const user = await this.verifyJwt(authorization);
      res.locals.user = user;
      return next();
    } catch (err) {
      return res.status(401).send({ error: err})
    }
}

module.exports.loginAuthentication = async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;
  const { authorization } = req.headers;

  if (authorization) {
    try {
      const user = await this.verifyJwt(authorization);
      return res.send({
        user,
        token: authorization,
      });
    } catch (err) {
      return res.status(401).send({ error: err });
    }
  }

  //User logging in with username password
  if (!usernameOrEmail || !password) {
    return res
      .status(400)
      .send({ error: "Please provide both a username/email and a password." });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    /*return error if user or password is missing as invalid credentials*/
    if (!user || !user.password) {
      return res
        .status(400)
        .send({ error: "The username or password is incorrect." });
    }

    /* BCRYPT COMPARE PASSWORDS, RETURN INCORRECT CREDENTIALS */
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return next(err);
      }
      if (!result) {
        return res
          .status(400)
          .send({ error: "The username or password is incorrect." });
      }
      res.send({
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
        },
        token: jwt.encode({ id: user._id }, process.env.JWT_SECRET),
      });
    });
  } catch (err) {
    next(err);
  }
};

module.exports.register = async (req, res, next) => {
  const { username, fullName, email, password } = req.body;
  let user = null;

  const usernameError = validateUsername(username);
  if (usernameError) return res.status(400).send({ error: usernameError });

  const fullNameError = validateFullName(fullName);
  if (fullNameError) return res.status(400).send({ error: fullNameError });

  const emailError = validateEmail(email);
  if (emailError) return res.status(400).send({ error: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).send({ error: passwordError });

  try {
    user = new User({ username, fullName, email, password });
    await user.save();
    res.status(201).send({
      user: {
        email: user.email,
        username: user.username,
      },
      token: jwt.encode({ id: user._id }, process.env.JWT_SECRET),
    });
  } catch (err) {
    next(err);
  }
};
