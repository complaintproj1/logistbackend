const express = require('express');
const app = express();
const dotenv = require('dotenv')
const PORT = process.env.PORT || 8086
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
var routes = require('./routes/routes');
const cors = require('cors');

dotenv.config()

app.use(cors(
    {
      origin: "http://localhost:4200"
    }
   
  ));
 
  mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connection Successful")
}).catch((err)=>console.log(err));



app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`)
})

app.use(express.json());

app.use(routes);