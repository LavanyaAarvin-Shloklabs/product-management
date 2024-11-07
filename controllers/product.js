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
        const bodyToCreate = {
            ...req.body,
            images: req.files,
            createdBy: req.userId
        }
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
        const productId = req.params.id;
        if(!productId) {
            return next(new ErrorResponse(`No product found with id of ${req.params.id}`, 404));
        }
        const product = await this.productService.getProductById(productId);
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

        const productId = req.params.id;
        if(!productId) {
            return next(new ErrorResponse(`No product found with id of ${req.params.id}`, 404));
        }

        const product = await this.productService.updateProductById(productId, req.body);
        if (!product) {
            return next(new ErrorResponse(`No product found with id of ${req.params.id}`, 404));
        }
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
        const product = await this.productService.deleteProductById(req.params.id);
        res.status(200).json(successResponse(product));
    });
}


module.exports = ProductController;