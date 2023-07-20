const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Estimate = require("../models/estimate");
const Invoice = require("../models/invoice");

router.post('/invoices', async (req, res) => {
  const invoiceData = req.body;
  const newInvoice = new Invoice(invoiceData);

  try {
    const savedInvoice = await newInvoice.save();
    res.status(200).json(savedInvoice);
  } catch (err) {
    res.status(500).json({ error: 'Error saving invoice data to database.' });
  }
});

const isAuthenticated = (req, res, next) => {
  const token = req.cookies["jwt"];

  if (!token) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }

  jwt.verify(token, "secret", async (err, claims) => {
    if (err) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });

    if (!user) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }

    req.user = user;
    next();
  });
};

// Endpoint to get invoices for the logged-in user
router.get('/invoices/:customerName', isAuthenticated, async (req, res) => {
  const customerName = req.params.customerName.toLowerCase(); // Retrieve the customerName parameter from the URL in lowercase

  // Check if the customerName in the URL matches the authenticated user's customerName
  if (customerName !== req.user.name.toLowerCase()) {
    return res.status(403).send({
      message: "You are not authorized to access this invoice.",
    });
  }

  try {
    const invoices = await Invoice.find({ customerName }); // Retrieve invoices for the specified customerName
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving invoice data.' });
  }
});



router.post('/todos', (req, res) => {
  const todo = new Estimate(req.body);
  todo.save()
    .then(() => {
      res.status(201).json(todo);
    })
    .catch((error) => {
      console.error('Error saving todo:', error); // Log the error for debugging purposes
      res.status(400).json({ error: 'Failed to create todo' });
    });
});


router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const record = await User.findOne({ email: req.body.email });

  if (record) {
    return res.status(400).send({
      message: "Email is already registered",
    });
  } else {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const result = await user.save();

    const { _id } = await result.toJSON();

    const token = jwt.sign({ _id: _id }, "secret");

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({
      message: "user registered successfully",
    });
  }
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).send({
      message: "User not Found",
    });
  }

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).send({
      message: "Password is Incorrect",
    });
  }

  router.get('/api/invoices/:customerName', async (req, res) => {
    const customerName = req.params.customerName.toLowerCase(); // Retrieve the customerName parameter from the URL in lowercase
  
    try {
      const invoices = await Invoice.find({ customerName }); // Retrieve invoices for the specified customerName
      res.json(invoices);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error retrieving invoice data.' });
    }
  });
  const token = jwt.sign({ _id: user._id }, "secret");

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.send({
    message: "user logined successfully",
  });
});


router.get("/user", async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];

    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }


    const user = await User.findOne({ _id: claims._id });

    const { password, ...data } = await user.toJSON();

    res.send(data);
  } catch (e) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });

  res.send({
    message: "user logout succssfully",
  });
});

module.exports = router;