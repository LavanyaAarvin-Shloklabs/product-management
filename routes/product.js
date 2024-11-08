const router = require('express').Router({mergeParams: true});
const {productController} = require('../bootstrap');
const Product = require('../models/Product');
const advancedResults = require('../middleware/advancedResults');
const {validateDocument} = require('../middleware/validateDocument');
const {protectRoutes, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage }).array('images', 10); // Limit to 10 images

router.post('/', protectRoutes, authorizeRoles('admin'), upload, productController.createProduct);

router.get('/' , protectRoutes, advancedResults(Product), productController.getAllProducts);
router.get('/:id', protectRoutes, validateDocument(Product, (req) => ({
    _id: req.params.id
})), productController.getProductById);
router.put('/:id', protectRoutes, authorizeRoles('admin'), upload, validateDocument(Product, (req) => ({
    _id: req.params.id
})), productController.updateProductById);
router.delete('/:id', protectRoutes, authorizeRoles('admin'), validateDocument(Product, (req) => ({
    _id: req.params.id
})), productController.deleteProductById);

module.exports = router;