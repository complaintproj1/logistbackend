const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
var routes = require('./routes/routes');
const cors = require('cors');

app.use(cors(
    {
      origin: "http://localhost:4200"
    }
   
  ));
  const DB= 'mongodb+srv://mayank:newwork@estimatesdb.xb3xbag.mongodb.net/logist?retryWrites=true&w=majority';
  mongoose.connect(DB).then(()=>{
    console.log("Connection Successful")
}).catch((err)=>console.log(err));



app.listen(8086,function port(error)
{
    if(error)
    {
        console.log(error)
    }
    else
    {
        console.log("Port  Connectedddd!!!!!!!!!!! 8086")
    }
});

app.use(express.json());

app.use(routes);