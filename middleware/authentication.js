const jwt = require('jsonwebtoken');
const authentication = (req,res,next)=>{
    const token =  req.cookies?.token
    if(token){
        const decoded = jwt.verify(token, 'shhhhh');
        //console.log(decoded)
        if(decoded){
            next()
        }
        else{
            res.send("wrong token")
        }
    }
    else{
        res.send("wrong token")
    }
}

module.exports = {authentication}