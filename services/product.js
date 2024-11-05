const BaseService = require('./baseService');

class ProductService extends BaseService {
    constructor(productRepository) {
        super(productRepository);
    }
}

module.exports = ProductService;
