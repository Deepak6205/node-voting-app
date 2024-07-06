const mongoose = require('mongoose');
require('dotenv').config();
//define mongoDb URL

const mongoURL = process.env.MONGODB_URl_LOCAL; //replace my database with your database name

//const mongoURL = process.env.MONGODB_URL;

//setup mongoDb Connection

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//get the default connection
//mongoose maintains a default connection object representing the MongoDb connection.

const db = mongoose.connection;

// define event Listners for database connection

db.on('connected',()=>{
    console.log('Connected to MongoDB server');
});

db.on('error',(err)=>{
    console.error('MongoDB connection error', err);
});

db.on('disconnected',()=>{
    console.log(' MongoDB server disconnected');
});

// Export the database connection

module.exports = db;