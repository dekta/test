const express= require("express")
const {Sequelize, DataTypes} = require("sequelize")
const bcrypt = require('bcrypt');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const app =  express()
app.use(cookieParser())
app.use(express.json())

const {authentication} = require("./middleware/authentication")


const sequelize = new Sequelize("assignment",'root',process.env.pass,{
    host:"localhost",
    dialect:"mysql"
})

sequelize.authenticate().then(()=>{
    console.log("connected to db")
}).catch(()=>{
    console.log("connection failed")
})

const User = sequelize.define("users",{
    id:{
        type:DataTypes.SMALLINT,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    }

})

const Order = sequelize.define("orders",{
    Orderid:{
        type:DataTypes.SMALLINT,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    quantity:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    totalprice:{
        type:DataTypes.INTEGER,
        allowNull:false
    }

})


sequelize.sync().then(()=>{
    console.log("server started")
}).catch(()=>{
    console.log("something went wrong")
})

app.post("/auth/register",(req,res)=>{
    const {id,name,email,password} = req.body
    bcrypt.hash(password, 5, function(err, hash) {
        User.create({id,name,email,password:hash}).then(()=>{
            console.log("user created")
        }).catch((err)=>{
            console.log("some error",err)
        })
    });
    res.send("record saved")
})

app.post("/auth/login",async(req,res)=>{
    const {email,password} = req.body
    let user = await  User.findOne({
        where:{
            email:email
        }
    })
    if(user){
        let hash = user.password
        bcrypt.compare(password, hash, function(err, result) {
        if(result){
            const token = jwt.sign({userId:user._id,email,role:user.role}, 'shhhhh');
            res.cookie("token", token, {httpOnly : true})
            res.status(200).send({"msg":"login successfully","token":token})
            }
        });
    }
    else{
        res.status(401).send("user not exist")
    }

})

app.use(authentication)

app.post("/orders/create",(req,res)=>{
    const order = req.body
    Order.create(order).then(()=>{
        console.log("order successful")
    }).catch((err)=>{
        console.log("some error")
    })
    res.send("order done")
})

app.delete("/orders/delete/:orderId",async(req,res)=>{
    const id = req.params
    console.log(id)
    await Order.destroy({
        where:{
            id:id.orderId
        }
    })
    res.send("order deleted")
})

// app.get("/orders",async(req,res)=>{
//     const orders = await Order.findAll()
//     return res.send(orders)
// })

app.listen(8800,()=>{
    console.log("server connected")
})

