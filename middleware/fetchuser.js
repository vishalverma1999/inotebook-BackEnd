const jwt = require('jsonwebtoken');   // imported from jswebtoken package
const JWT_SECRET = 'Harryisagoodb$oy'; // generally kept secretly in other file like .env.local

// here fetchuser is a middleware which takes req,res and next as parameters, at the end next middleware run hoga aur hamare case mein next function hai async wala
const fetchuser = (req, res, next)=>{
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');    // token ko hum header se lekar aayenge...means jab post request maarenge tab uske header mein auth-token daaldenge jo ki login karne ke baad generate hoga
    if(!token){       // agar token maujood hi nahi hai
        res.status(401).send({error:"Please authenticate using a valid token"});
    }
    
    try {
       // Agar humara token verify ya valid nahi hua to? isliye hum ise try catch vlock mein daalenge
    const data = jwt.verify(token, JWT_SECRET);    // Synchronously verify given token using a secret or a public key to get a decoded token
    req.user = data.user;      // kya matlab hai req.user ka???
    next(); 
    } 
    catch (error) {
        res.status(401).send({error:"Please authenticate using a valid token"})
    }
    
}


module.exports = fetchuser;    //exporting fetchuser function