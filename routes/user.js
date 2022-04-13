const User = require("../models/User");
const { verifyToken, verifyTokenAndAuthorization } = require("./VerifyToken");

const router = require("express").Router();

router.put("/:id", verifyTokenAndAuthorization, (req, res) => {
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        req.body.password = hash;
      }
    });
  }
  User.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
