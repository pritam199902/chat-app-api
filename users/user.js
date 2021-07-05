const bcrypt = require('bcrypt')
const User = require('../models/User')
const Message = require('../models/Message')

const users = []
const Status = []
const UserSession = []



const addUser = async ({ userid, name, email, password, socketid }) => {
    const existingUser = await User.findOne({ email: email })
    // console.log("existed user : ", existingUser)
    if (existingUser) {
        const data = {
            error: true,
            user: null,
            message: `Hi ${existingUser.name}, you already have account! please login!`
        }
        return data
    } else {

        const hash = await bcrypt.hash(password, 10)
        if (hash) {

            const newUser = new User({ userid, name, email, password: hash })
            const saved = await newUser.save()


            // console.log("new user saved res : ", saved);
            if (saved) {


                const i = Status.findIndex(d => d.userid === saved.userid)
                // console.log(i);
                if (i !== -1) {
                    Status[i].isOnline = true
                } else {
                    const s = {
                        userid: saved.userid,
                        isOnline: true
                    }
                    Status.push(s)
                }


                const j = UserSession.findIndex(d => d.userid === saved.userid)
                // console.log(i);
                if (j !== -1) {
                    UserSession[j].socketid = socketid
                } else {
                    const ss = {
                        userid: saved.userid,
                        socketid: socketid
                    }
                    UserSession.push(ss)
                }



                const user = {
                    userid: saved.userid,
                    image: '',
                    name: saved.name,
                    email: saved.email,
                    createOn: saved.createOn,
                    lastSeen: saved.createOn,
                    socketid
                }

                return { error: false, user, message: `Hi ${user.name}, welcome to ChatApp!` }
            } else {
                const data = {
                    error: true,
                    user: null,
                    message: `Fail to signup! Please try again!`
                }
                return data
            }
        } else {
            const data = {
                error: true,
                user: null,
                message: `Fail to signup! Please try again!`
            }
            return data
        }
    }
}






const loginUser = async ({ email, password, socketid }) => {
    const existingUser = await User.findOne({ email: email, isActive: true })
    if (existingUser) {
        const isMatched = await bcrypt.compare(password, existingUser.password)
        if (isMatched) {

            const i = Status.findIndex(d => d.userid === existingUser.userid)
            if (i !== -1) {
                Status[i].isOnline = true
            } else {
                const s = {
                    userid: existingUser.userid,
                    isOnline: true
                }
                Status.push(s)
            }

            const j = UserSession.findIndex(d => d.userid === existingUser.userid)
            // console.log(i);
            if (j !== -1) {
                UserSession[j].socketid = socketid
            } else {
                const ss = {
                    userid: existingUser.userid,
                    socketid: socketid
                }
                UserSession.push(ss)
            }


            const user = {
                userid: existingUser.userid,
                name: existingUser.name,
                image: existingUser.image,
                email: existingUser.email,
                createOn: existingUser.createOn,
                lastSeen: existingUser.createOn,
                socketid
            }

            return { error: false, user, message: `Hi ${user.name}, welcome to ChatApp!` }


        } else {
            const data = {
                error: true,
                user: null,
                message: `Invalid email or password!`
            }
            return data
        }
    } else {
        const data = {
            error: true,
            user: null,
            message: `Invalid email or password!`
        }
        return data
    }
}






const removeUser = ({ id }) => {
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}




const getCurrentUser = async ({ userid }) => {
    const user = await User.findOne({ userid: userid, isActive: true }).select('-password -isActive')
    // const sid = UserSession.filter(u => u.userid === userid).length > 0 ? UserSession.filter(u => u.userid === userid)[0].socketid : null
    // if (sid) {
        if (user) {
            return user 
        } else return null

    // } else return

}



const getCurrentUserStatus = async ({ userid }) => {
    var status = await Status.filter(us => us.userid === userid)[0]
    // console.log("get status :: ", status);
    // console.log(users);
    return { status }
}


const verifyUser = async ({ userid, email }) => {
    console.log("verifying..");
    const user = await User.findOne({ userid: userid, email: email, isActive: true })
    if (user) {
        console.log("verified!");
        return { error: false, isVerified: true }

    } else {
        console.log("fail!");
        return { error: true, isVerified: false }
    }
}




const allUser = async ({ userid }) => {
    // console.log(userid);
    var users = await User.find({ userid: { $ne: userid }, isActive: true }).select('userid name email image lastSeen')
    // console.log(users);
    return { users }
}




const allChatUser = async ({ userid }) => {
    const users = await User.find({ send_by: userid })
    return { users }
}


const allUserStatus = async () => {
    console.log(Status);
    var status = Status
    return { status }
}




const logoutUser = async ({ userid }) => {
    
    const i = Status.findIndex(d => d.userid === userid)
    if (i !== -1) {
        Status[i].isOnline = false
    } else {
        const s = {
            userid: userid,
            isOnline: false
        }
        Status.push(s)
    }

    var status = Status
    return { status }
}





const getUserInRoom = ({ room }) => {
    return users.filter(u => u.room === room)
}




const loadMessage= async({sender, receiver})=>{
    const list= await Message.find({sender:{"$in":[sender,receiver]}, receiver:{"$in":[sender,receiver]}} )

    // console.log("all messages : ", list );
    return list
}


const sendMessage = async ({sender, receiver, text}) =>{
    const msg = await new Message ({sender, receiver, text}).save()

    if (msg){
        // console.log("new message saved : ", msg);
        const list = await loadMessage ({sender, receiver});
        return list
    }else{
        return false        
    }
    
    

}




module.exports = { addUser, removeUser, logoutUser,  getCurrentUser, getCurrentUserStatus, getUserInRoom, verifyUser, allUser, allChatUser, loginUser, allUserStatus, sendMessage, loadMessage }