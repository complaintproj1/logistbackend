const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Estimate = require("../models/estimate");
const Invoice = require("../models/invoice");
const nodemailer = require('nodemailer')
const Contact = require('..//models/contact');

const YOUR_JWT_SECRET_KEY = process.env.YOUR_JWT_SECRET_KEY;

const multer = require('multer');


// Node Mailer setup

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

//send email api

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

//send email on confirm estimate
router.post('/estimate', async (req, res) => {
  try {
    const { id, email, length, breadth, height, multiplier, estimateResult,actualweight } = req.body;

    // ... code to handle the estimate data and generate the estimate ID (e.g., using MongoDB) ...
    // 
    console.log('Received Estimate Data:', req.body);

    // Sample code to send the confirmation email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Change to the email service you want to use
      auth: {
        user: '981mayankchauhan@gmail.com',
        pass: 'sfpuruhushrvjvaj'
      }
    });

    // Create the HTML table content
    const tableContent = `
      <table border="1">
      
        <tr>
        <th>Actual Weight</th>
        <th>Id</th>
          <th>Length</th>
          <th>Breadth</th>
          <th>Height</th>
          <th>Multiplier</th>
          <th>Estimate Result</th>
        </tr>
        
        <tr>
        <td>${actualweight}</td>
        <td>${id}</td>
          <td>${length}</td>
          <td>${breadth}</td>
          <td>${height}</td>
          <td>${multiplier}</td>
          <td>${estimateResult}</td>
        </tr>
      </table>
    `;

    const mailOptions = {
      from: '981mayankchauhan@gmail.com', // Replace with your email address
      to: email,
      subject: 'Your Invoice ID from Logistics',
      html: `<p>Your Invoice ID is: ${id}. The estimated result is:</p>${tableContent}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending the email.' });
  }
});
 /* 
router.post('/api/estimate', async (req, res) => {
  const { email, length, breadth, height, multiplier,estimateResult } = req.body;

  // ... code to handle the estimate data and generate the estimate ID (e.g., using MongoDB) ...

  // Find the estimate document based on the provided email
  try { const filter = { $and: [{ email }, { estimateResult }] };
  const foundEstimate = await Estimate.findOne(filter);

    if (!foundEstimate) {
      return res.status(404).json({ error: 'No estimate found for the provided email.' });
    }

    const generatedEstimateId = foundEstimate._id;
    const generatedEstimateResult = foundEstimate.estimateResult;

    // Sample code to send the confirmation email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Change to the email service you want to use
      auth:{
        user:'981mayankchauhan@gmail.com',
        pass:'sfpuruhushrvjvaj'
     }
    });

    const mailOptions = {
      from: '981mayankchauhan@gmail.com', // Replace with your email address
      to: email,
      subject: 'Your Invoice ID from Logistics',
      text: `Your Invoice ID is: ${generatedEstimateId}. The estimated result is: ${generatedEstimateResult}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending confirmation email:', error);
        res.status(500).json({ error: 'Error sending confirmation email.' });
      } else {
        console.log('Confirmation email sent:', info.response);
        res.status(200).json({ success: true, estimateId: generatedEstimateId, result:generatedEstimateResult }); // Send the generated _id as part of the response
      }
    });
  } catch (error) {
    console.error('Error finding estimate:', error);
    res.status(500).json({ error: 'Error finding estimate.' });
  }
});
 */


 /* router.post('/api/estimate', async (req, res) => {
  const { email, length, breadth, height, multiplier, estimateResult } = req.body;

  const generatedEstimateId = req.body.generatedEstimateId; // Use the generatedEstimateId from the response

  // Sample code to send the confirmation email using Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Change to the email service you want to use
    auth:{
      user:'981mayankchauhan@gmail.com',
      pass:'sfpuruhushrvjvaj'
   }
  });

  const mailOptions = {
    from: '981mayankchauhan@gmail.com', // Replace with your email address
    to: email,
    subject: 'Your Invoice ID from Logistics',
    text: `Your Invoice ID is: ${generatedEstimateId}. The estimated result is: ${estimateResult}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending confirmation email:', error);
      res.status(500).json({ error: 'Error sending confirmation email.' });
    } else {
      console.log('Confirmation email sent:', info.response);
      res.status(200).json({ success: true, estimateId: generatedEstimateId }); // Send the generated _id as part of the response
    }
  });
});
 */
// create invoice api

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

// update status of invoice api

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

//updat status(good in warhouse) of estimate api
router.put('/estimatesone/:id/status', async (req, res) => {
  const estimateId = req.params.id;
  const newStatus = 'Goods in warehouse'; 

  try {
    const updatedEstimate = await Estimate.findByIdAndUpdate(
      estimateId,
      { status: newStatus },
      { new: true }
    );
    updatedEstimate.statusHistory.push({
      status: newStatus,
      timestamp: Date.now(),
    });

    // Set the color to 'green' for 'Goods in warehouse' status
    await updatedEstimate.save();
    res.status(200).json(updatedEstimate);
  } catch (err) {
    res.status(500).json({ error: 'Error updating estimate status.' });
  }
});

//updat status(reached hub) of estimate api
router.put('/estimatestwo/:id/status', async (req, res) => {
  const estimateId = req.params.id;
  const newStatus = 'reached hub'; 

  try {
    const updatedEstimate = await Estimate.findByIdAndUpdate(
      estimateId,
      { status: newStatus },
      { new: true }
    );
    updatedEstimate.statusHistory.push({
      status: newStatus,
      timestamp: Date.now(),
    });

    // Set the color to 'green' for 'Goods in warehouse' status
    await updatedEstimate.save();
    res.status(200).json(updatedEstimate);
  } catch (err) {
    res.status(500).json({ error: 'Error updating estimate status.' });
  }
});

//updat status(out for delivery) of estimate api

router.put('/estimatesthree/:id/status', async (req, res) => {
  const estimateId = req.params.id;
  const newStatus =' out for delivery';
  try {
    const updatedEstimate = await Estimate.findByIdAndUpdate(
      estimateId,
      { status: newStatus },
      { new: true }
    );updatedEstimate.statusHistory.push({
      status: newStatus,
      timestamp: Date.now(),
    });
    await updatedEstimate.save();
    
    res.status(200).json(updatedEstimate);
  } catch (err) {
    res.status(500).json({ error: 'Error updating invoice status.' });
  }
});

//get all invoice api

router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find(); // Retrieve all invoices from the database
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching invoices from the database.' });
  }
});

//get all estimate api

router.get('/estim', async (req, res) => {
  try {
    const estimates = await Estimate.find(); // Retrieve all invoices from the database
    res.status(200).json(estimates);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching invoices from the database.' });
  }
});

//create estimate api

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

//tarck cestimate for indivual api

router.get('/estimates/:id', async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found.' });
    } res.status(200).json(estimate);
   // res.status(200).json({length:estimate.length,{USERID:estimate.id}});
  } catch (err) {
    res.status(500).json({ error: 'Error fetching the estimate from the database.' });
  }
});

//register user api 

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

    const token = jwt.sign({ _id: _id }, process.env.YOUR_JWT_SECRET_KEY );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({
      message: "user registered successfully",
    });
  }
});

//login user api

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

  const token = jwt.sign({ _id: user._id }, process.env.YOUR_JWT_SECRET_KEY);

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.send({
    message: "user logined successfully",
  });
});

//get user name in profile api

router.get("/user",async(req,res)=>{
  try {
   const cookie = req.cookies['jwt']
   const claims = jwt.verify(cookie,process.env.YOUR_JWT_SECRET_KEY)

   if(!claims){
       return res.status(401).send({
           message:"unauthorized"
       })
   }
const user = await User.findOne({_id:claims._id})

const {password,...data}=await user.toJSON()
res.send(data)
  } catch (error) {
   return res.status(401).send({
       message:'unauthenticated'
   })
   
  }
})

//logout api

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });

  res.send({
    message: "user logout succssfully",
  });
});



router.post('/updatethreeStatus/:estimateId', async (req, res) => {
  const estimateId = req.params.estimateId;

  // Your logic to update the status based on the estimateId
  // ...

  // Fetch the user's email by ID
  try {
    const estimate = await Invoice.findById(estimateId).exec();
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    // Send the email to the user
    const email = estimate.email; // Assuming the email field is present in the estimate object
    await sendEmail(email);

    return res.status(200).json({ message: 'Status updated, and email sent successfully' });
  } catch (error) {
    console.error('Error updating status and sending email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to send the email using Nodemailer
function sendEmail(email) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: 'your-email@example.com',
      to: email,
      subject: 'Product Out for Delivery',
      text: 'Your product is out for delivery.',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info.response);
      }
    });
  });
}
router.post('/sendEmail/:estimateId', async (req, res) => {
  const estimateId = req.params.estimateId;

  // Fetch the user's email by ID
  try {
    const estimate = await Estimate.findById(estimateId).exec();
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    const email = estimate.email; // Assuming the email field is present in the estimate object

    // Send the email to the user
    await sendEmail(email, estimateId);

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to send the email using Nodemailer
function sendEmail(email, estimateId) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: '981mayankchauhan@example.com',
      to: email,
      subject: 'Product Out for Delivery',
      text: `Your product with ID ${estimateId} is out for delivery.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info.response);
      }
    });
  });
}

//conact form api
router.post('/contact', async (req, res) => {
  try {
    const { fullname, email, message } = req.body;
    const contact = new Contact({ fullname: fullname, email, message });
    const savedContact = await contact.save();
    res.json(savedContact);
  } catch (error) {
    console.error('Error saving data:', error); // Log the error details
    res.status(500).json({ message: 'Error saving data.' });
  }
});

//get all user complaint/contact
router.get('/complaint/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Estimate not found.' });
    } res.status(200).json(contact);
   // res.status(200).json({length:estimate.length,{USERID:estimate.id}});
  } catch (err) {
    res.status(500).json({ error: 'Error fetching the estimate from the database.' });
  }
});

//get all complaint

router.get('/comp', async (req, res) => {
  try {
    const contacts = await Contact.find(); // Retrieve all invoices from the database
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching invoices from the database.' });
  }
});

router.put('/reest/:id/isconfirm', async (req, res) => {
  const generatedId = req.params.id;

  try {
    const updatedInvoice = await Estimate.findByIdAndUpdate(
      generatedId,
      { isconfirm: 'true' },
      { new: true }
    );
    res.status(200).json(updatedInvoice);
  } catch (err) {
    res.status(500).json({ error: 'Error updating invoice status.' });
  }
});


router.put('/estimates/:id', async (req, res) => {
  try {
    const estimate = await Estimate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }
    res.json(estimate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;