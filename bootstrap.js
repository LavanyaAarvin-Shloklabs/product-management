const ProductRepository = require('./repositories/product');
const CategoryRepository = require('./repositories/category');

const ProductService = require('./services/product');
const CategoryService = require('./services/category');

const ProductController = require('./controllers/product');
const CategoryController = require('./controllers/category');

// Instantiate the repositories
const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();

// Instantiate the services
const categoryService = new CategoryService(categoryRepository);
const productService = new ProductService(productRepository, categoryService);

// Instantiate the controllers
const categoryController = new CategoryController(categoryService);
const productController = new ProductController(productService);

module.exports = {
    productController,
    categoryController
};
