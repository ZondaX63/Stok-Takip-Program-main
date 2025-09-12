const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contactPerson: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    creditLimit: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        default: '',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
}, { timestamps: true });

SupplierSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Supplier', SupplierSchema);
