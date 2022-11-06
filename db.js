// Below we are writing code to connect to mongo database, connecting to basic(means khudka ka computer is working as express server) mongodb server
const mongoose = require('mongoose');   // mongoose imported
const mongoURI = process.env.MONGO_URL        // connection string hoti hai jo "" ke andar likhi hai...it helps to connect to mongodb server...filhal ye string local computer ki hai....agar kisi remote mongo server se connect karna hai to uski string lagegi
// /iNotebook? /aur? ke beech mein likhne se database banjayega mongo with iNotebook name

// mongoose return promises to aap promises ke saath deal kar sakte ho..jaise mongoose.connect ka callback function run karega when promise is resolved....instead of call back function you can use async await also

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{          // mongoose.connect is a method, whose parameters are- uri string and callback function
        console.log("Connected to mongo successfully");
    })
}



module.exports = connectToMongo;  // connectToMongo function is exported