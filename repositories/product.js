const Product = require('../models/Product');
const BaseRepositorySoftDelete = require("./baseRepositorySoftDelete");

class ProductRepository extends BaseRepositorySoftDelete {
    constructor() {
        super(Product); // Pass the model to the base repository
    }
}

module.exports = ProductRepository;
