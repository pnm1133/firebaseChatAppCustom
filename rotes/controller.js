const express = require('express')

const routes = express()

const admin = require('firebase-admin')

const functions = require('firebase-functions')

// var serviceAccount = require("G:/TEST-SERVER/firendAppChat/android-code-lab-firebase-adminsdk-t7tfj-04ab48a0c1.json");

admin.initializeApp(functions.config().firebase);
// var storage = require('@google-cloud/storage')()
// var albumsAvatar = storage.bucket('albumsAvatar')

var db = admin.firestore()


//body parser---------
var bodyParser = require('body-parser')
routes.use(bodyParser.urlencoded({
    extended: true
  }))
routes.use(bodyParser.json())
//===================

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + "/" + hour + ":" + min + ":" + sec;

}

var setAuth =  function(req,res,next){
    var token = req.body.token;
    admin.auth().verifyIdToken(token)
    .then(decodeIdToken=>{
        req.uid = decodeIdToken.uid
        console.log('decode token');
        next()
        return
    })
    .catch(rejectErrorFirebaseAuth=>{
        console.log('eror auth');
        res.status(401).json({
            err: '401 authention'
        })
    }) 
}

 var isUserExist =  function(req,res,next){
    var idUser = req.uid
    return  db.collection('users').doc(idUser).get()
    .then(snapshot=>{
        if(snapshot.exists){
            console.log('User exit')
            return true
        }else{
            console.log('User not exit')
            return false
        }
    
    })
    .catch(err=>{
        console.log("err check user")
        next(err)
    })
}

var createUserDb =  function(req,res,next){
    var user =  req.body.user
    var d = new Date()
    user.createAt = getDateTime()
    var uid = req.uid
    console.log(user.name)
    return db.collection('users').doc(uid).set(user)
    .then(write=>{
        console.log(write.writeTime)
        res.status(200).json({
            result:"ok"
        })
        return 
    })
    .catch(err=>{
        console.log('error')
        next(err)
    })
}

var getListConversation = function(req,res,success){
    var idUser = req.uid
    var conversationList = db.collection('users').
                                doc(idUser)
                                    .collection('conversations')
    return conversationList
    .get()
    .then(querySnapshot=>{
        var listConversationDilog = []
            querySnapshot.forEach(doc=>{
            var conversation = doc.data()
            conversation.id = doc.id
            conversation.senderAvatar = null
            listConversationDilog.push(conversation)
        })
        return listConversationDilog
    })
    .catch(err=>{
        console.log('Error getting documents', err);
    })
}


var getAvatar = function(userID){
    return db.collection('users').doc(userID)
    .get()
    .then(doc=>{
        if (!doc.exists) {
            console.log('No such document!');
            return null
          } else {
            return doc.data().avatar
        }
    })    
}

var queryFriendOnline = function(userId){
    return db.collection('users')
        .doc(userId)
        .collection('friends')
        .get()
        .then(list => {
            var listFriends = []
            list.forEach(element=>{
                listFriends.push(element)
            })
           
            return listFriends
        }).catch(err =>{
            console.log(err)
        })
}


var getMemberConversation =  function(conversationId){
    return db.collection('conversations')
                .doc(conversationId)
                .collection('members')
                .get()
                .then(snapshot=>{
                    return snapshot
                })
                .catch(err=>{
                    next(err)
                })
}

var getInforUser = function(userId){
    console.log('getInforUser')
    return db.collection('users')
        .doc(userId)
        .get()
        .then(doc=>{
            return doc.data()
        }).catch(err =>{
            next(err)
        })
}



module.exports.setAuth = setAuth
module.exports.createUserDb = createUserDb
module.exports.isUserExist = isUserExist
module.exports.getListConversation = getListConversation
module.exports.getAvatar = getAvatar
module.exports.queryFriendOnline = queryFriendOnline
module.exports.getMemberConversation = getMemberConversation
module.exports.getInforUser = getInforUser






