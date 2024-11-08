const mongoose = require('mongoose');
const logger = require('../logger')(module)

const connectDB = async () => {

    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true,
            dbName: process.env.DB_NAME
        });
        logger.debug(`MongoDB Connected: ${conn.connection.host} with database ${process.env.MONGO_DATABASE_NAME}`);
    }catch(err) {
        logger.debug(`MongoDB Error: ${err.message}`);
        logger.debug(err);
        process.exit(1);
    }
};

module.exports = connectDB;