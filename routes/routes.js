const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Estimate = require("../models/estimate");
const Invoice = require("../models/invoice");
const nodemailer = require('nodemailer')

const multer = require('multer')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).single('attachment');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
       user:'981mayankchauhan@gmail.com',
       pass:'sfpuruhushrvjvaj'
    }
});

router.post('/send-email', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log('Error uploading file:', err);
      return res.status(500).send('Error uploading file.');
    }

    const { to, subject, text } = req.body;
    const attachment = req.file;

    if (!to || !subject || !text || !attachment) {
      return res.status(400).send('Please provide all required fields.');
    }

    const mailOptions = {
      from: '981mayankchauhan@gmail.com', // Replace with your email address
      to,
      subject,
      text,
      attachments: [{ filename: attachment.originalname, path: attachment.path }],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).send('Error sending email.');
      }

      console.log('Email sent:', info.response);
      return res.status(200).send('Email sent successfully.');
    });
  });
});


router.post('/invoices', async (req, res) => {
  const invoiceData = req.body;
  const newInvoice = new Invoice(invoiceData);

  try {
    const savedInvoice = await newInvoice.save();
    console.log('Invoice saved successfully:', savedInvoice);
    res.status(200).json(savedInvoice);
  } catch (err) {
    console.error('Error saving invoice data to database:', err);
    res.status(500).json({ error: 'Error saving invoice data to database.' });
  }
});


router.put('/invoices/:id/status', async (req, res) => {
  const invoiceId = req.params.id;

  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: 'done' },
      { new: true }
    );
    res.status(200).json(updatedInvoice);
  } catch (err) {
    res.status(500).json({ error: 'Error updating invoice status.' });
  }
});

router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find(); // Retrieve all invoices from the database
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching invoices from the database.' });
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