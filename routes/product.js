const router = require('express').Router({mergeParams: true});
const {productController} = require('../bootstrap');
const Product = require('../models/Product');
const {uuidVerificationMiddleware} = require('../middleware/conditionalMiddleware');
const advancedResults = require('../middleware/advancedResults');


router.post('/',productController.create);
router.get('/' ,advancedResults(Product), productController.findAll);
router.get('/:id',productController.findById);
router.put('/:id',productController.updateById);
router.delete('/:id',productController.deleteById);

module.exports = router;