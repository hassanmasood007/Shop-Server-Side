const Cart = require("../models/Cart");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, (req, res) => {
  const newCart = new Cart(req.body);
  newCart
    .save()
    .then((newCart) => {
      res.status(200).json(newCart);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, (req, res) => {
  Cart.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then((updatedCart) => {
      res.status(200).json(updatedCart);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Delete
router.delete("/:id", verifyTokenAndAuthorization, (req, res) => {
  Cart.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).json({
        message: "Cart has been deleted...",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET USER CART

router.get("/find/:userId", verifyTokenAndAuthorization, (req, res) => {
  Cart.findOne({ userId: req.params.userId })
    .then((cart) => {
      res.status(200).json(cart);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
