const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require("../logger")(module);

const protectRoutes = asyncHandler(async (req, res, next) => {
    logger.debug("Checking authorization");

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    
    try {
        // Decode without verification
        const decoded = jwt.decode(token, { complete: true });
        // const verifiedJwt = jwt.verify(token, process.env.JWT_SECRET, {algorithms: ['HS256']});
        // console.log("verifiedJwt >>> :",verifiedJwt)
        req.userId = decoded.payload.id;
        req.userRole = decoded.payload.role;

        next();
    } catch (err) {
        logger.error("Token verification failed:", err.message);
        return next(new ErrorResponse('Token is not valid', 401));
    }
});

// Role-based Authorization Middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return next(new ErrorResponse('User role is not authorized to access this route', 403));
        }
        next();
    };
};

module.exports = {
    protectRoutes,
    authorizeRoles
};