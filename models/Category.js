const mongoose = require('mongoose');
const excludeDeletedDocuments = require("../utils/excludeDeletedDocuments");
const logger = require('../logger')(module);
const Constants = require("../models/utils/constants")

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide product name"],
        unique: true
    },
    description: String,

    createdBy: {
        type: String,
    },
    
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

CategorySchema.plugin(excludeDeletedDocuments, {deletedField: "isDeleted"});

module.exports = mongoose.model(Constants.CATEGORY, CategorySchema);
