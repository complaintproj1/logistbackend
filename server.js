const express = require('express')

const dotenv = require('dotenv')
const PORT = process.env.PORT || 8000
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const routes = require('./routes/routes')

const cors = require('cors')

const cookieParser = require('cookie-parser')

dotenv.config()

const app = express()




app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
  }));
app.use(cookieParser())

app.use(express.json())
app.use('/api', routes)
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connection Successful")
}).catch((err)=>console.log(err));


app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`)
  })

  
app.use(express.json());

