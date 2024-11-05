const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../logger')(module);

class DiscountController {
    constructor(discountService) {
        this.discountService = discountService;
    }

    /**
     * @desc    Create a new discount
     * @route   POST /api/discounts
     * @access  Private
     */
    create = asyncHandler(async (req, res, next) => {
        validateDurationAndDiscountStart(req.body);
        const discount = await this.discountService.create(req.body);
        if (!discount) {
            return next(new ErrorResponse('Error creating discount', 400));
        }
        res.status(201).json({ success: true, data: discount });
    });

    /**
     * @desc    Get all discounts
     * @route   GET /api/discounts
     * @access  Public
     */
    findAll = asyncHandler(async (req, res, next) => {
        res.status(200).json(res.advancedResults);
    });

    /**
     * @desc    Get a discount by ID
     * @route   GET /api/discounts/:id
     * @access  Public
     */
    findById = asyncHandler(async (req, res, next) => {
        const discount = await this.discountService.findById(req.params.id);
        if (!discount) {
            return next(new ErrorResponse(`No discount found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({ success: true, data: discount });
    });

    /**
     * @desc    Update a discount by ID
     * @route   PUT /api/discounts/:id
     * @access  Private
     */
    updateById = asyncHandler(async (req, res, next) => {
        let discount = await this.discountService.findById(req.params.id);
        if (!discount) {
            return next(new ErrorResponse(`No discount found with id of ${req.params.id}`, 404));
        }
        validateDurationAndDiscountStart({...(discount.toObject()), ...req.body})
         discount = await this.discountService.updateById(req.params.id, req.body);
        if (!discount) {
            return next(new ErrorResponse(`No discount found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({ success: true, data: discount });
    });

    /**
     * @desc    Delete a discount by ID
     * @route   DELETE /api/discounts/:id
     * @access  Private
     */
    deleteById = asyncHandler(async (req, res, next) => {
        await this.discountService.deleteById(req.params.id);
        res.status(200).json({ success: true, message: 'Discount deleted' });
    });
}

const validateDurationAndDiscountStart = (discount) => {
    logger.debug("Save section executed:", discount);
    if (discount.validityDuration && (discount.discountStart || discount.discountEnd)) {
        throw new Error('Specify either a validity duration or a discount period, not both.');
    } else if (!discount.validityDuration && !(discount.discountStart && discount.discountEnd)) {
        throw new Error('You must specify either a validity duration or a complete discount period.');
    }
}

module.exports = DiscountController;