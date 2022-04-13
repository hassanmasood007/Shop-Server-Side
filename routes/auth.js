const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Register
router.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    } else {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
      });
      newUser
        .save()
        .then((result) => {
          res.status(201).json(result);
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
    }
  });
});

//LOGIN
router.post("/login", (req, res) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Wrong Credentials",
        });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (result) {
            const accessToken = jwt.sign(
              {
                id: user._id,
                isAdmin: user.isAdmin,
              },
              process.env.JWT_KEY,
              { expiresIn: "1h" }
            );
            const { password, ...other } = user._doc;
            res.status(200).json({ ...other, accessToken });
          } else if (!result) {
            return res.status(401).json({
              message: "Wrong Credentials",
            });
          } else if (typeof err !== "undefined") {
            return res.status(500).json({
              error: err,
            });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
