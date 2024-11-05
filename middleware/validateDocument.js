const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

const validateDocument = (Model, getQueryFromReq) => asyncHandler(async (req, res, next) => {
    const query = getQueryFromReq(req);
    const object = await Model.findOne(query);

    if (!object) {
        return next(new ErrorResponse(`${Model?.modelName ?? "Document"} not found`, 404));
    }

    req.foundObject = object;
    next();
});

//Sample usage
// router.post('/',validateDocument(Model, (req) => ({ _id: req.body.objectID })), controller.function);


module.exports = {
    validateDocument
}