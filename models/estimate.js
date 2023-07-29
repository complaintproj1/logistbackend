
const mongoose = require('mongoose')


const estimateSchema = new mongoose.Schema({
  
  email: { type: String, 
   
    required: true },
  contact: { type: String, required: true },
    length: {
        type: Number,
        required: true
    },
    breadth: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    multiplier:{
        type:Number,
        required:true
    },
    estimateResult:{
        type:Number,
        required:true
    },
    status: {
        type: String,
        default: 'Received goods', // Default status is 'pending', but it will be updated to 'done' when clicked on the upload button.
      },
    actualweight:{
            type:Number,
            required:true

      },
    
      isconfirm:{
        type:Boolean,
        default:false
      },
      changeDate: { type: Date, required: true, default: Date.now }

})

module.exports = mongoose.model('Estimate', estimateSchema)