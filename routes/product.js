const Product = require("../models/Product");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./VerifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, (req, res) => {
  const newProduct = new Product(req.body);
  newProduct
    .save()
    .then((newProduct) => {
      res.status(200).json(newProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//UPDATE

router.put("/:id", verifyTokenAndAdmin, (req, res) => {
  Product.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then((updatedProduct) => {
      res.status(200).json(updatedProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Delete
router.delete("/:id", verifyTokenAndAdmin, (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).json({
        message: "Product has been deleted...",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET PRODUCT

router.get("/find/:id", (req, res) => {
  Product.findById(req.params.id)
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET ALL PRODUCTS

router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;
    if (qNew === "true") {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
