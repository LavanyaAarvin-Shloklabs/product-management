const mongoose = require('mongoose');

const connectDB = async () => {

    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true,
            dbName: process.env.DB_NAME
        });
        console.log(`MongoDB Connected: ${conn.connection.host} with database ${process.env.DB_NAME}`);
    }catch(err) {
        console.log(`MongoDB Error: ${err.message}`);
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;