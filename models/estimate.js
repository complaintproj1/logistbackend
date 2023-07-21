
const mongoose = require('mongoose')

const estimateSchema = new mongoose.Schema({
    name: { type: String, required: true },
  email: { type: String, required: true },
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
    }

})

module.exports = mongoose.model('Estimate', estimateSchema)