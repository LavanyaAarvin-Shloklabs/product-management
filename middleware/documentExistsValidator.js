const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

const checkObjectExists = (Model, getQueryFromReq) => asyncHandler(async (req, res, next) => {
    const query = getQueryFromReq(req);
    const object = await Model.findOne(query);

    if (!object) {
        return next(new ErrorResponse(`${Model?.modelName ?? "Document"} not found`, 404));
    }

    req.foundObject = object;
    next();
});

module.exports = {
    checkObjectExists
}