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