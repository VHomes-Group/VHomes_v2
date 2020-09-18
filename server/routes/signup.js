const bcrypt = require('bcryptjs')
const express = require("express");

const User = require("../models/user.model");
const { getUserToken } = require('../auth');
const { asyncHandler, passGenService } = require("../utils");
// this is the user model for saving to schema
// see this doc for more info
// https://mongoosejs.com/docs/tutorials/findoneandupdate.html

const router = express.Router();

/* POST users listing. */
router.post("/", async (req, res) => {
  const name = req.query.name;
  const email = req.query.email;
  var password = req.query.password;
  if (password === undefined || name === undefined || email === undefined) {
    res.status("200").json("invalid input");
  }
  // hash the password
  password = await utils.passGenService(password);
  // filtering based on email
  const filter = { email };
  const update = { $setOnInsert: { name, password } };

  let rawResult = await User.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    rawResult: true,
  });

  // the following flag helps determine if the document was updated
  if (rawResult.lastErrorObject.updatedExisting) {
    res.status(200).json({
      error: "user already exists",
    });
  } else {
    res.status(200).json({
      message: "user signed up",
    });
  }
});

/* Seamus' Sign-up for self testing */
// router.post('/', asyncHandler(async (req, res, next) => {
//   const { email, name, password } = req.body;
//   const pwRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

//   if (!pwRegEx.test(password)) {
//     const err = new Error(
//       'Password must contain at least 1 lowercase letter, uppercase letter, number, a special character (i.e. "!@#$%^&*"), and have a length of at least 8.'
//     );
//     err.name = 'Registration Error';
//     err.status = 400;
//     return next(err);
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   let user;

//   try {
//     user = await User.create({ email, name, password: hashedPassword });
//     user.save();
//   } catch (e) {
//     /* Handle empty name and / or email */
//     if (e.errors) {
//       let errorsArr = [];
//       Object.keys(e.errors).map(errorName => {
//         const errorMessage = e.errors[errorName].message;
//         errorsArr.push(errorMessage);
//       })
//       return next({
//         'errors': errorsArr,
//         'status': 400
//       })
//     }
//     /* Handle duplicate email */
//     if (e.code === 11000) {
//       const err = new Error('Email already exists');
//       err.name = 'Registration Error';
//       err.status = 400;
//       return next(err);
//     }
//     return next(e)
//   }

//   if (user) {
//     const token = getUserToken(user);
//     res.json({
//       token,
//     })
//   }
// }));

module.exports = router;
