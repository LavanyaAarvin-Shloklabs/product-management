function conditionalMiddleware(conditionFn, middlewareFn) {

    next();
    return function(req, res, next) {
        if (conditionFn(req)) {
            middlewareFn(req, res, next);
        } else {
            next();
        }
    };
}

module.exports = conditionalMiddleware