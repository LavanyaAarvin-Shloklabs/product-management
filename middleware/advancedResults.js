const advancedResults = (model, populate) => async (req, res, next) => {
    try {

        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query String
        let queryString = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc.)
        queryString = queryString.replace(/\b(gt|gte|lt|lte|in|ne)\b/g, match => `$${match}`);

        // Finding resource with filters applied
        query = model.find(JSON.parse(queryString));

        // If there's a type filter, adjust the countDocuments query
        let countQuery = { ...JSON.parse(queryString) }; // Copy filters for counting

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.category) {
            const categoryName = req.query.category;

            // Populate category with match condition to filter by category name
            query = query.populate({
                path: 'category',
                match: { name: categoryName },
                select: 'name description' // Select fields if necessary
            });

            // This filters out products where the category doesn't match
            query = query.where({ categoryId: { $ne: null } });
        } else if (populate) {
            // Apply default population if no specific category filter is present
            query = query.populate(populate);
        }

        // If category filter is used, it may return some null categories, so we filter those out
        query = query.where({ categoryId: { $ne: null } });

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            const priceFilter = {};
            
            if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
            query = model.find({ price: priceFilter });
            countQuery.price = priceFilter; 
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination setup
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25; // Default limit to 25 if not specified
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Count total documents with the same filters applied to the query
        const total = await model.countDocuments(countQuery);

        query = query.skip(startIndex).limit(limit);

        if (populate) {
            query = query.populate(populate);
        }

        // Executing Query
        const results = await query;

        // Pagination results
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }
        if (startIndex > 0) {
            pagination.previous = {
                page: page - 1,
                limit
            };
        }

        // Attaching results to response
        res.advancedResults = {
            success: true,
            total,
            count: results.length,
            pagination,
            data: results
        }

        next();
    } catch (e) {
        next(new Error(`Error while querying: ${e}`));
    }
};

module.exports = advancedResults;