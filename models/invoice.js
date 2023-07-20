const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contactNo: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    products: [{
        name: {
            type:String,
            required:true

        },
        price: {
            type:Number,
            required:true
        },
        qty: {
            type:Number,
            required:true
        }
    }],
    additionalDetails: {
        type:String,
        required:true
    }

})

module.exports = mongoose.model('Invoice', invoiceSchema)