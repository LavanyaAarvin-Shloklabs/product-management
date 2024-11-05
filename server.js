const express = require('express');
const dotEnv = require('dotenv');

//Load env vars
dotEnv.config({path:'./config/.env'});

const path = require('path');
const errorHandler = require('./middleware/error');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const logger = require('./logger')(module)

const connectDB = require('./config/db');
require('./bootstrap');  // Initialize and wire up dependencies



//Connect to database
connectDB();

const app = express();
//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//All the app defaults are above. Below is the business logic, that includes the imports as well
const product = require('./routes/product');

//Mount routers
app.use('/api/v1/products', product);

//use the custom error handler only after basic routes...
app.use(errorHandler);

const PORT = process.env.PORT || 4001;

logger.info("information log")
logger.warn("warning log")
logger.error("error log")
logger.debug("debug log")


const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} on port ${process.env.PORT}`);
});
app.get('/', ((req, res) => {
    res
        .status(200)
        .send(`Welcome To Node Express Mongo SEYO Template<br/> <br/> Version: ${process.env.VERSION} `)
}));
//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
//    Close server $ exit process
    server.close(() => process.exit(1));
});

//Prevent XSS(Cross Site Scripting)
app.use(xss());