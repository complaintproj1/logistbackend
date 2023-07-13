const express = require('express');
const app = express();
const dotenv = require('dotenv')
const PORT = process.env.PORT || 8086
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
var routes = require('./routes/routes');
const cors = require('cors');

dotenv.config()
const allowedOrigins = ['https://daakgadi.web.app']; // Add your Firebase Hosting URL here

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);  mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connection Successful")
}).catch((err)=>console.log(err));



app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`)
})

app.use(express.json());

app.use(routes);