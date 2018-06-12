const functions = require('firebase-functions');

const express = require('express');

const inforUserRoutes = require('./rotes/userRoutes');

const app = express();

// handle error here

app.use('/',inforUserRoutes)

app.use((err,req, res,next) =>{
    console.log('index handle error');
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).json({
        status: err.statusCode,
        err:err
    })
})

var getInforUser = functions.https.onRequest(app)

// var conversations = functions.https.onRequest(app)

module.exports = {getInforUser}
