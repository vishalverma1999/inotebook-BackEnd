const express = require('express');   // express imported
const User = require('../models/User');  //User modle imported
const router = express.Router(); // using Router, since express ke andar ek router hota hai
const { body, validationResult } = require('express-validator');  // validator imported
const bcrypt = require('bcryptjs');   // imported from bcryptjs package
const jwt = require('jsonwebtoken');   // imported from jswebtoken package
const JWT_SECRET = process.env.JWT_SECRET; // generally kept secretly in other file like .env.local
const fetchuser = require('../middleware/fetchuser');    // importing fetchuser

// router.get('/', (req, res)=>{   // since we are using router to hum app.get nahi router.get karenge, also '/' /api/auth jo ki app.use() mein index.js file mein likhi hai ke last mein lagega aur aisa dikhega fir /api/auth/....uske baad callback function run hoga with two parameters request and response
// obj = {
//     a: "thios",
//     number: 99
// }
// res.json(obj);
// })


// How to send something in request ki body
// router.post('/', (req,res)=>{
//     console.log(req.body);
//     res.send('hello')
// })

// Create a User using: POST "/api/auth/" , Doesn't require Auth
// User ko create karne ke liye req ki body mein likhna padega data in json format....video 45 mein hum thunderclient ki help se body ka json content likh rahe hai
// router.post('/', (req,res)=>{
//     console.log(req.body);
//     // res.send('hello')
//     res.send(req.body);
// })


// Creating New User using POST '/api/auth/'  by async promise method, No login required
// router.post('/',[
//     body('name', 'Enter a valid name').isLength({ min: 3 }),   // 'Enter a valid name'--> default msg to show in errors array if validation is not true
//     body('email', 'Enter a valid email').isEmail(),   // ek valid email hona chaiye
//     body('password', 'password must be at least 5 chars long').isLength({ min: 5 }),
// ], (req,res)=>{
//     // if there are errors, return the bad request and the errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {   // agar errors empty nahi hai i.e false to !false i.e true karke if condition chalado
//       return res.status(400).json({ errors: errors.array() });  // array of errors will be returned with msg,value,param and location
//     }

//     User.create({          // creating user in mongodb last video mein shayad user.save() se kiya tha
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password
//       }).then(user => res.json(user))
//       .catch((error)=>{console.log(error)
//       res.json({error: 'please enter unique email', message: error.message})})   // error.message--> displays the message
// })



// ROUTE-1 Creating New User using POST '/api/auth/createuser'   by async await method, No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),   // 'Enter a valid name'--> default msg to show in errors array if validation is not true
    body('email', 'Enter a valid email').isEmail(),   // ek valid email hona chaiye
    body('password', 'password must be at least 5 chars long').isLength({ min: 5 }),
], async (req, res) => {

    let success = false;
    // if there are errors, return the bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {   // agar errors empty nahi hai i.e false to !false i.e true karke if condition chalado
        return res.status(400).json({ success, errors: errors.array() });  // array of errors will be returned with msg,value,param and location
    }


    try {
        // Check whether the user with this email already exists
        //  Instead of using createIndexes() to make unique email....we will write logic here to ensure email to be unique 
        let user = await User.findOne({ email: req.body.email });  // User model par humne findOne() method lagaya hai user ko email dega body mein se
        if (user) {    // if user with the email exists, to bas game over return kardo error ki aisa email db mein hai already
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" });
        }

        // HASHING THE PASSWORD USING Salt and bcrypt
        const salt = await bcrypt.genSalt(10);   // genSaltSync works synchronously but we used the asynchronous one i.e genSalt(), hence await use karna padega kyunki promise return karega
        const securedPassword = await bcrypt.hash(req.body.password, salt);   // hashSync works synchronously but we used the asynchronous one i.e hashSync(), hence await use karna padega kyunki promise return karega
        user = await User.create({          // creating user in mongodb last to last video mein shayad user.save() se kiya tha
            name: req.body.name,
            email: req.body.email,
            password: securedPassword
        })

        // jab koi login karega to hume use usi ka entered data thodina denge hum use token denge
        // tokens mainly are seesion token and json web token
        // Here We will use json web token--> In short jwt is a way to verify user, client aur server ke beech facilitates secured communication, jwt has 3 parts--> token type, data, secret
        const data = {
            user: {
                id: user.id   // ye mongodb ke andar jo entries hai users ki unke corresponding id hai
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);   // sign() is synchronus method
        console.log(authToken);
        // res.json(authToken);    //intead of sending user in response we will send jsw token
        success = true;
        res.json({ success, authToken });  // es6, now we don't need to write like authToken: authToken, automatically ho jayega
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})



// ROUTE-2: Authenticate a User using: POST '/api/auth/login'   by async await method, No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),   
    body('password', 'password cannot be blank').isLength({ min: 5 })
], async (req, res) => {
    
    let success = false;
    // if there are errors, return the bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {   // agar errors empty nahi hai i.e false to !false i.e true karke if condition chalado
        return res.status(400).json({ errors: errors.array() });  // array of errors will be returned with msg,value,param and location
    }

    // in ideal case when user sends the valid email and valid password
    const { email, password } = req.body;     // destructuring
    try {
        let user = await User.findOne({email});   // User model mein find karo ki jo input kiya hai email wo hai, hai to user mein aayegi nahi hai to user mein null aayega, findOne() is a asynchronous method
        if(!user){    // agar model ya database mein email nahi mila to return kard error
            return res.status(400).json({ errors: "Please try to login with correct credentials" });
        }

        // Ab agar email mil jaata hai to password ko compare karo database mein stored hash se
        const passwordCompare = await bcrypt.compare(password, user.password);  // compare() is a asynchronous method, returns boolean
        if(!passwordCompare){
            success = false;
            return res.status(400).json({ success, errors: "Please try to login with correct credentials" });
        }


        // Ab agar password email san sahi hai to user ka data bhejna hai
        const data = {
            user: {
                id: user.id   // ye mongodb ke andar jo entries hai users ki unke corresponding id hai
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);   // sign() is synchronus method
         success = true;
        res.json({ success, authToken });   // success isliye daal taaki jab response aaye to true aur false bataye, if sahi hai to true else false aur fir uski help se frontend mein logic develop ho sake like if(json.success) do this or do that

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 3: Get loggedin User detaild using: POST "/api/auth/getuser". Login required
// fetchuser is a middleware, middleware--> ek function hota hai jo call kiya jaayega jab bhi aapke jo login required waale routes hai un par request aayegi, middleware isliye use kiya kyunki agar user ki id lene ka code yahi likhte to wo bas yahi tak valid hota aur maanlo kisi aur endpoint ko bhi authentication ki jarurat hoti user id ki to waha alag se likhna padta, isliye to save from this hum ek middleware daaldenge jaha bhi authentication vhaiye
router.post('/getuser', fetchuser,  async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");  // Dekho aisa hai ki jab humne authtoken banaya tha tab humne jo data paas kiya tha jwt.sign() mein, us data mein humne mongodb mein jo data entries thi unko unki id se grab kiya tha aur data mein daalkar auth token bana diya tha,,,,which means agar hum us authtoken mein se us particular user id ko nikaal le ya decode karle to hum fir jo login ho chuka hai us user ki details ko nikal paayenge,,,,aur fir us data mein se sab kuch select kar lena except password 
        res.send(user);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router;  // This is written taaki is router ko inde.js mein app.use() ki madad se use kar paayein
