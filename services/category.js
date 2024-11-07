const BaseService = require('./baseService');

class CategoryService extends BaseService {
    constructor(categoryRepository) {
        super(categoryRepository);
    }
}

module.exports = CategoryService;
