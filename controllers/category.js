const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../logger')(module);
const successResponse = require("../utils/successResponse")

class CategoryController {
    constructor(categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * @desc    Create a new category
     * @route   POST /api/v1/category
     * @access  Private
     */
    createCategory = asyncHandler(async (req, res, next) => {
        logger.debug("Create a category");
        const category = await this.categoryService.create(req.body);
        if (!category) {
            return next(new ErrorResponse('Error creating category', 400));
        }
        res.status(201).json(successResponse(category));
    });

    /**
     * @desc    Get all categories
     * @route   GET /api/v1/category
     * @access  Private
     */
    getAllCategories = asyncHandler(async (req, res, next) => {
        logger.debug("Get all category");
        res.status(200).json(res.advancedResults);
    });

    /**
     * @desc    Get a category by ID
     * @route   GET /api/v1/category/:id
     * @param   {string} req.params.id - The ID of the category
     * @access  Private
     */
    getCategoryById = asyncHandler(async (req, res, next) => {
        logger.debug("Get category By Id");
        const category = await this.categoryService.findById(req.params.id);
        if (!category) {
            return next(new ErrorResponse(`No category found with id of ${req.params.id}`, 404));
        }
        res.status(200).json(successResponse(category));
    });

    /**
     * @desc    Update a category by ID
     * @route   PUT /api/v1/category/:id
     * @param   {string} req.params.id - The ID of the category
     * @access  Private
     */
    updateCategoryById = asyncHandler(async (req, res, next) => {
        logger.debug("Update category by Id");
        let category = await this.categoryService.findById(req.params.id);
        if (!category) {
            return next(new ErrorResponse(`No category found with id of ${req.params.id}`, 404));
        }
        category = await this.categoryService.updateById(req.params.id, req.body);
        if (!category) {
            return next(new ErrorResponse(`No category found with id of ${req.params.id}`, 404));
        }
        res.status(200).json(successResponse(category));
    });

    /**
     * @desc    Delete a category by ID
     * @route   DELETE /api/v1/category/:id
     * @param   {string} req.params.id - The ID of the category
     * @access  Private
     */
    deleteCategoryById = asyncHandler(async (req, res, next) => {
        logger.debug("Delete category by Id");
        const deletedCategory = await this.categoryService.deleteById(req.params.id);
        res.status(200).json(successResponse(deletedCategory));
    });
}


module.exports = CategoryController;