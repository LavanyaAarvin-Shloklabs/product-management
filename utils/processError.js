const ErrorResponse = require("./errorResponse");
const logger = require("../logger")(module);
const processError = (err) => {
    let error = {...err};
    error.message = err.message;

//  Log to logger
    logger.error(err);

    //Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

//Mongoose duplicate error Code
    if (err.code === 11000) {
        let message = `Duplicate field value entered: ${err.message}`;
        message = composeMessageForMongoError11000(message);
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'MongoBulkWriteError' && err.code === 11000) {
        logger.debug('Number of write errors:', err.writeErrors ? err.writeErrors.length : 0);

        // Handle duplicate key errors
        let failedDocs = [];
        err.writeErrors.forEach((error) => {
            logger.debug("MongoBulkWriteError - Document at index ", error.err.errmsg);
            const tempError = composeMessageForMongoError11000(error.err.errmsg);
            failedDocs.push({error: tempError, document: error.err.op});
        });
        let message = {
            message: "Document were not created successfully",
            documentsFailed: failedDocs
        }
        if(err.insertedDocs){
            message = {
                message: "Few Document were created successfully and others were not created",
                documentsCreated: err.insertedDocs,
                documentsFailed: failedDocs
            }
        }
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        console.log(Object.values(err.errors).map(value => value));
        const message = Object.values(err.errors).map(value => value.message);

        error = new ErrorResponse(message.toString(), 400);
    }

    return error;
}


function composeMessageForMongoError11000(message) {
    if (message.includes('displayName')) {
        message = `Given display name already exists, Please enter a new display name`;
    }
    if (message.includes('title')) {
        message = `Given title already exists, Please enter a new title`;
    }
    if (message.includes('responsetypes')) {
        message = `Response Type already exists`;
    }
    if (message.includes('email')) {
        message = `Given email already exists, Please enter a unique email id`;
    }
    if (message.includes('contactNumber')) {
        message = `Given contactNumber already exists, Please enter a unique contactNumber`;
    }
    return message;
}

module.exports = processError