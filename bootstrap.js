//Injecting Discount controller

const ProductRepository = require('./repositories/product');
const ProductService = require('./services/product');
const ProductController = require('./controllers/product');

// Instantiate the repository - Inject the repository into the service - Inject the service into the controller
const productController = new ProductController(new ProductService(new ProductRepository()));

module.exports = {
    productController,
};
