const express = require('express')

const bodyParser = require('body-parser')

const controller = require('./controller')

const routes = express.Router()

routes.use(bodyParser.urlencoded({
    extended: true
  }))
routes.use(bodyParser.json())

routes.get('/',(req,res,next)=>{
    res.status(200).send('phan minh nguyen')
})

routes.use('/user',controller.setAuth)
routes.post('/user/create',  (req,res,next)=>{
    new Promise((resolve, reject) =>{
        resolve(controller.isUserExist(req,res,next))
    })
    .then(resloveChecking=>{
        if(resloveChecking){
            res.status(200).json({
                    response : req.uid
                })
        }else{
            controller.createUserDb(req,res,next)
        }
        return
    })
.catch(rejectChecking=>{
        console.log(rejectChecking)
        next(rejectChecking)
    });
})

routes.post('/user/listconversation',(req,res,next)=>{

    controller.getListConversation(req,res)
                .then(list=>{
                    if(list.length === 0){
                        console.log('list size '+list.length)
                        res.status(200).json({
                            conversation: null
                        })
                    }
                    var count = -1
                    list.forEach(element=>{
                        controller.getInforUser(element.senderId)
                            .then(url=>{
                                // element.senderAvatar = url.avatar
                                element.sender = url
                                return
                            }).then(()=>{
                                count ++
                                if(count === list.length-1){
                                    console.log(" oke ")
                                    res.status(200).json({
                                        conversation:list
                                    })
                                } 
                                return
                            })
                            .catch(err=>{
                                console.log('Error getting documents', err);
                                next(err)
                            })
                    }) 
                    return
                })
                .catch(err=>{
                    console.log('Error getting documents', err);
                })           
})   

routes.post('/user/list-friend-online',(req,res,next)=>{
        var uid = req.uid
        console.log('uid : '+uid)
        controller.queryFriendOnline(uid)
                    .then(list => {
                        if(list.size === 0){
                            console.log('list size '+list.length)
                            res.status(200).json({
                                friends: null
                            })
                        }
                        var count = -1
                        var listUser = []
                        list.forEach(element=>{
                            controller.getInforUser(element.id)
                            .then(user => {
                                count ++
                                listUser.push(user)
                                console.log("count : " + count)
                                if(count === list.length-1){
                                    console.log(" oke ")
                                    res.status(200).json({
                                        friends :listUser
                                    })
                                }
                                return
                            }).catch(err=>{
                                next(err)
                            })
                        })

                        return
                    })
                    .catch(err=>{
                        next(err)
                    })
})


routes.post('/user/get-conversation-member/:conversationId',(req,res,next)=>{
    var id = req.params.conversationId
    console.log(id)
    controller.getMemberConversation(id)
                .then(list=>{

                    if(list.length === 0){
                        console.log('list size '+list.size)
                        res.status(200).json({
                            friends: null
                        })
                    }

                    var count = -1
                    var listUser = []

                    list.forEach(element=>{
                        controller.getInforUser(element.id)
                        .then(user => {
                            count ++
                            listUser.push(user)
                        
                            if(count === (list.size-1)){
                                console.log(" oke ")
                                res.status(200).json({
                                    members : listUser
                                })
                            }
                            return
                        }).catch(err=>{
                            next(err)
                        })
                    })
                    return
                })
                .catch()
})

module.exports = routes