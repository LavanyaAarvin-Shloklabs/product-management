const mongoose = require('mongoose');
const excludeDeletedDocuments = require("../utils/excludeDeletedDocuments");
const logger = require('../logger')(module)

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    id: false,
});

ProductSchema.plugin(excludeDeletedDocuments, {deletedField: "isDeleted"});

module.exports = mongoose.model('Product', ProductSchema);
