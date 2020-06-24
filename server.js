const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(process.env.PORT, () => {
  console.log(`App running on port ${port}.......`);
});

// REPLACING THE <PASSWORD> PART OF STRING WITH REAl PASSWORD
const db = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// CONNECTING TO DATABASE
mongoose
  .connect(db, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(err => {
    console.log('DB Connection Successful!!!');
  });

process.on('unhandledRejection', err => {
  console.log(err.name, '. ', err.message);
  console.log('Unhandled Rejection. Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});

//Heroku restart our application every 24 hours..but it does harsfully even if a request is proceessing
process.on('SIGTERM', () => {
  console.log('SIGTERM RECIEVED ,, Shutting down...');
  server.close(() => {
    console.log('Process terminated');
  });
});
