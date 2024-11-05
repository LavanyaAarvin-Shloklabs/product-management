/**
 * Sequentially processes an array of authentication middleware for a request, ensuring only one passes.
 * It acts as an "either-or" gate, where the request is authenticated if at least one middleware succeeds.
 * If all middleware fail, the request is denied, making it versatile for routes with diverse authentication needs.
 * @param {Function[]} middlewares - Array of middleware functions for authentication strategies.
 * Usage Example:
 * app.use('/api/protected', multiAuthMiddleware([internalUserMiddleware, externalUserMiddleware]), (req, res) => {
 *   res.json({ message: 'Authenticated successfully' });
 * });
 */

const combineAuthentication = (middlewares) => (req, res, next) => {
    const handleMiddleware = (index) => {
        if (index === middlewares.length) {
            return next(new Error('Authentication failed'));
        }

        middlewares[index](req, res, (err) => {
            if (err) {
                handleMiddleware(index + 1);
            } else {
                next();
            }
        });
    };

    handleMiddleware(0);
};

module.exports = {
    combineAuthentication
}