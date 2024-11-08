const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../logger')(module);
const successResponse = require("../utils/successResponse")

class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    /**
     * @desc    Create a new product
     * @route   POST /api/v1/product
     * @access  Private
     */
    createProduct = asyncHandler(async (req, res, next) => {
        logger.debug("Create a product");
        const bodyToCreate = { ...req.body, images: req.files, createdBy: req.userId }
        const product = await this.productService.createProduct(bodyToCreate)
        if (!product) {
            return next(new ErrorResponse('Error creating product', 400));
        }
        res.status(201).json(successResponse(product));
    });
    

    /**
     * @desc    Get all products
     * @route   GET /api/v1/product
     * @access  Private
     */
    getAllProducts = asyncHandler(async (req, res, next) => {
        logger.debug("Get all product");
        const products = res.advancedResults.data;
        const updatedAdvancedResults = await this.productService.getAllProducts(products, req.query)
        res.advancedResults.data = updatedAdvancedResults
        res.status(200).json(res.advancedResults);
    });

    /**
     * @desc    Get a product by ID
     * @route   GET /api/v1/product/:id
     * @param   {string} req.params.id - The ID of the product
     * @access  Private
     */
    getProductById = asyncHandler(async (req, res, next) => {
        logger.debug("Get Product By Id");
        const product = await this.productService.getProductById(req.params.id);
        res.status(200).json(successResponse(product));
    });

    /**
     * @desc    Update a product by ID
     * @route   PUT /api/v1/product/:id
     * @param   {string} req.params.id - The ID of the product
     * @access  Private
     */
    updateProductById = asyncHandler(async (req, res, next) => {
        logger.debug("Update product by Id");
        const bodyToCreate = {...req.body,images: req.files}
        const product = await this.productService.updateProductById(req.params.id, bodyToCreate);
        res.status(200).json(successResponse(product));
    });

    /**
     * @desc    Delete a product by ID
     * @route   DELETE /api/v1/product/:id
     * @param   {string} req.params.id - The ID of the product
     * @access  Private
     */
    deleteProductById = asyncHandler(async (req, res, next) => {
        logger.debug("Delete product by Id");
        const product = await this.productService.deleteById(req.params.id);
        res.status(200).json(successResponse(product));
    });
}


module.exports = ProductController;