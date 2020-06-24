// const http = require('http');
// NPM MODULES
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

// USER MODULES
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const errorHandler = require('./controllers/errorController');

const app = express();

// SET THE VIEW ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// SERVE STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// SETTING ESSENTIAL HEADERS
app.use(helmet());

// ALLOW USE OF COOKIES
app.use(cookieParser());

// TO LIMIT REQ, PREVENTS BRUTEFORCE ATTACK
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 1000 * 60 * 60,
    message: 'Too many Attempts!! Please after some time'
  })
);

// MIDDLEWARE -POPULATE THE REQ.BODY OBJ WITH DATA FROM BODY PARSER
app.use(
  express.json({
    limit: '10kb',
    // WHEN TRUE ONLY ARRAYS AND OBJ CAN BE PASSED IN BODY PARSER ELSE ANYTHING
    strict: true
  })
);

// SANITIZING THE DATA
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

app.use(compression());

// TO ENABLE CROSS ORIGIN REQ
app.use(cors()); // ONLY WORK FOR GET AND POST

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;
