const express = require('express')
const PORT = process.env.PORT || 5000
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose');


const router = require('./router')
const action = require('./users/user')


const app = express()
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: "*",
    }
})



// datebase setup
// const dbUrl = "mongodb://localhost:27017/chat"
const dbUrl = `mongodb+srv://admin:admin@chatapp@cluster0.6csly.mongodb.net/chatapp?retryWrites=true&w=majority`
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
mongoose.connection.on("error", err => {
    console.log("database error : ", err)
})
mongoose.connection.on("connected", (err, res) => {
    console.log("database is connected")
})



app.use(cors())
app.use(router)



// socket connection
io.on('connect', (socket) => {
    console.log("Someone joined!");



    // signup event
    socket.on('signup', async ({ name, email, password }, callback) => {
        const data = {
            userid: socket.id,
            email: email,
            name: name,
            password: password,
            socketid: socket.id
        }
        const res = await action.addUser(data)
        if (res && res.user && !res.error) {

            socket.broadcast.emit('newUserAdded', { load: true, name: data.name })
            console.log("new user signeup");
            socket.join(data.userid)



            const status = await action.allUserStatus()
            socket.broadcast.emit('getUserStatus', status)

        }
        callback(res)
    })





    // login event
    socket.on('login', async ({ email, password }, callback) => {
        const data = {
            email: email,
            password: password,
            socketid: socket.id
        }
        const res = await action.loginUser(data)
        if (res && res.user && !res.error) {
            console.log("one user is logging in....");

            // socket.join(data.userid)
            const status = await action.allUserStatus()
            socket.broadcast.emit('getUserStatus', status)
        }
        callback(res)
    })




    // verify user sync
    socket.on('verifyUser', async ({ userid, name, email }, callback) => {
        const data = {
            userid: userid,
            email: email,
            name: name,
        }
        const res = await action.verifyUser(data)
        callback(res)
    })




    // load all user
    socket.on('getAllUser', async ({ userid }, callback) => {
        const res = await action.allUser({ userid: userid })
        callback(res)
    })




    // load all chat user
    socket.on('getAllChatUser', async ({ userid }, callback) => {
        const res = await action.allChatUser({ userid })
        callback(res)
    })



    // current user status
    // socket.on("getCurrentUserStatus", async ({ userid }, callback) => {
    //     console.log("get current user status :  ", userid);
    //     const status = action.getCurrentUserStatus({ userid })
    //     console.log("current user status :  ", status);
    //     callback({ status })
    // })



    // socket.on("getCurrentUser", async ({ userid }, callback) => {
    //     console.log("get current user :  ", userid);
    //     const user = action.getCurrentUser({ userid })
    //     // console.log(user);
    //     if (user) {
    //         const data = {
    //             user,
    //             error: false,
    //             message: ''
    //         }
    //         const status = action.getCurrentUserStatus({ userid })
    //         socket.broadcast.emit('currentUserStatus', status)
    //         callback(data)
    //     } else {
    //         const data = {
    //             user: null,
    //             error: true,
    //             message: 'Invalid user found!'
    //         }
    //         callback(data)

    //     }
    // })





    socket.on('join', async ({ myuserid, userid }, callback) => {
        console.log("some joined!", myuserid, " >> ", userid);
        // const status = await action.getCurrentUserStatus({ userid })
        // console.log("get status :: ", status);

        const user = await action.getCurrentUser({ userid })
        const list = await action.loadMessage({sender : myuserid, receiver: userid})
        if (user && list) {
            socket.join(userid)
            // console.log("get current user :: ", user);
            // socket.emit("currentUser", user)
            // socket.broadcast.emit('currentUserStatus', status)
            socket.broadcast.to(userid).emit('notification', { text: `${user.name} has joined!` })
            callback({ error: false, join: true, user: user, list : list })
        } else {
            callback({ error: true, join: false, message: 'Invalid user found!' })
        }
    })





    // socket.emit('notification', { user: "admin", text: `Hi, ${user.name}! welcome to room ${user.room}!` })
    // socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` })
    // console.log(`${user.name} joined!`);
    // socket.join(user.room)
    // io.to(user.room).emit('roomData', { room: user.room, users: action.getUserInRoom(user.room) })
    // callback()
    // })






    //  // load user status
    //  socket.on('getUserStatus', async ( {userid}, callback )=>{
    //     const res = await action.allChatUser({userid})
    //     // console.log("get all user :: ", res);
    //     callback(res)
    // })



    // socket.emit('users', { user: "admin", text: `Hi, ${user.name}! welcome to room ${user.room}!` })
    // socket.emit('message', { user: "admin", text: `Hi, ${user.name}! welcome to room ${user.room}!` })
    // socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` })
    // console.log(`${user.name} joined!`);
    // socket.join(user.id)

    // io.to(user.room).emit('roomData', { room: user.room, users: action.getUserInRoom(user.room) })
    // callback()
    //     }
    // })




    // join event
    // socket.on('join', ({ name, email, password }, callback) => {
    //     const data = {
    //         id: socket.id,
    //         email: name,
    //         name: name,
    //         password: password
    //     }
    //     const { error, user } = action.addCurrentUser({userid : data.id})
    //     if (error) return callback({ error: error })
    //     if (user) {
    //         socket.emit('users', { user: "admin", text: `Hi, ${user.name}! welcome to room ${user.room}!` })
    //         socket.emit('message', { user: "admin", text: `Hi, ${user.name}! welcome to room ${user.room}!` })
    //         socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` })
    //         console.log(`${user.name} joined!`);
    //         socket.join(user.room)
    //         // io.to(user.room).emit('roomData', { room: user.room, users: action.getUserInRoom(user.room) })
    //         callback()
    //     }
    // })





    // send message by user
    socket.on('sendMessage', async ({ data }, callback) => {
        // get user
        // console.log(data);
        // const user = await action.getCurrentUser({ userid : data.receiver })
        // console.log("sender : ", user);

        // if (!user) return callback({ error: "Invalid user!" })
        if (data) {
            const list = await action.sendMessage(data)
            // emit the message to the room
            io.to(data.sender).emit('message', list)

            // io.to(data.sender).to(data.receiver).emit('message', list)
            console.log("message emited");
            // io.to(data.userid).emit('roomData', { room: user.room, users: action.getUserInRoom(user.room) })
            // callback
            callback({ isSent: true, list })
        }
    })



    socket.on('loadMessage', async ({ sender, receiver }, callback) => {

        if (sender && rceiver) {
            const list = await action.loadMessage({sender, receiver})
            callback({ list })
        } return false
    })






    socket.on('logout', ({ userid }) => {
        console.log("someone ofline!", userid);
        const status = action.logoutUser({ userid })
        // socket.broadcast.emit('currentUserStatus', status)

        // console.log(user);
        // console.log(`${user.name} left!`);
        // if (user) {
        //     io.to(user.room).emit('message', { user: 'admin', text: `${user.name} left!` })
        // }
    })




    // disconnect user
    socket.on('disconnect', () => {
        console.log("someone left!");
        // const user = action.removeUser({ id: socket.id })
        // console.log(user);
        // console.log(`${user.name} left!`);
        // if (user) {
        //     io.to(user.room).emit('message', { user: 'admin', text: `${user.name} left!` })
        // }
    })



})





server.listen(PORT, () => { console.log(`Server running on port::${PORT}`) })

