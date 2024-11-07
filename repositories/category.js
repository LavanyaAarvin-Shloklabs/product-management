const Category = require('../models/Category');
const BaseRepositorySoftDelete = require("./baseRepositorySoftDelete");

class CategoryRepository extends BaseRepositorySoftDelete {
    constructor() {
        super(Category); // Pass the model to the base repository
    }
}

module.exports = CategoryRepository;
