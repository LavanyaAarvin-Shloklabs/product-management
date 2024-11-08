const mongoose = require('mongoose');
const excludeDeletedDocuments = require("../utils/excludeDeletedDocuments");
const logger = require('../logger')(module);
const Constants = require("../models/utils/constants")

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide product name"],
        unique: true
    },
    description: String,

    price: {
        type: Number,
        required: [true, "Please provide price"]
    },

    stock: {
        type: Number,
        required: true
    },

    categoryId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },

    attributes : {
        type: [Object],
        required: false
    },

    // images: {
    //     type: [String],
    //     required: false,
    // },

    createdBy: {
        type: String,
        required: false
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

// Pre-validation to catch invalid types before they cause a CastError
ProductSchema.pre('validate', function(next) {
    if (typeof this.price !== 'number' || isNaN(this.price)) {
        return next(new Error("Price must be a valid number"));
    }
    if (!Number.isInteger(this.stock)) {
        return next(new Error("Stock must be an integer"));
    }
    next();
});

ProductSchema.virtual('category', {
    ref: Constants.CATEGORY, 
    localField: 'categoryId', 
    foreignField: '_id',
    justOne: false
});

ProductSchema.plugin(excludeDeletedDocuments, {deletedField: "isDeleted"});

module.exports = mongoose.model(Constants.PRODUCT, ProductSchema);
