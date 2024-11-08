const router = require('express').Router({mergeParams: true});
const { categoryController } = require('../bootstrap');
const Category = require('../models/Category');
const advancedResults = require('../middleware/advancedResults');
const {validateDocument} = require('../middleware/validateDocument');
const {protectRoutes, authorizeRoles} = require('../middleware/auth');


router.post('/', protectRoutes, authorizeRoles('admin'), categoryController.createCategory);
router.get('/' , protectRoutes, advancedResults(Category), categoryController.getAllCategories);
router.get('/:id', protectRoutes, validateDocument(Category, (req) => ({
    _id: req.params.id
})), categoryController.getCategoryById);
router.put('/:id', protectRoutes, authorizeRoles('admin'), validateDocument(Category, (req) => ({
    _id: req.params.id
})), categoryController.updateCategoryById);
router.delete('/:id', protectRoutes, authorizeRoles('admin'),validateDocument(Category, (req) => ({
    _id: req.params.id
})), categoryController.deleteCategoryById);

module.exports = router;