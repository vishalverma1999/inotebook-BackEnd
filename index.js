const connectToMongo = require('./db');     //exported connectToMongo function from db.js is grabbed in index.js
const express = require('express');      // index.js actually mein ek express server rahega
var cors = require('cors')

connectToMongo();  // Now run connectToMongo, since we have successfully taken connectToMongo from db.js
// Run karne ke liye we will use nodemon package that is npm i -D nodemon, -D is used to use it as devDependencies and don't want to make part of packages

const app = express()
const port = process.env.PORT || 5000;     // 3000 port par react app chalega

app.use(express.json());   // req.body ko use karne ke liye ek middleware banana padta hai like this, middleware helps to send requests in json to server...POST request mein jaise hum kuch content bhejte hai aur fir server se response aata hai
app.use(cors())

// app.get('/', (req, res) => {    //.get ek endpoint hai jo Hello vishal! return kar raha hai
//   res.send('Hello vishal!')
// })

// // Routes are inside '' in app.get like--> '/' , '/api/v1/login' , '/api/v1/signup'
// // we can write all our routes here in app.get like written below....but hum uski jagah prefer karenge ek folder structure
// app.get('/api/v1/login', (req, res) => {    
//   res.send('Hello login!')
// })

// app.get('/api/v1/signup', (req, res) => {    
//   res.send('Hello signup!')
// })
// //if you open the localhost 3000 and do this-->http://localhost:3000/api/v1/login, toh screen par result aayega Hello login!, iska matlab hum apne saari files ko yahi daal sakte hai....par usse guchud muchud h jayegi,therefore prefer file structure instead :)


// Available routes ko app.use() karke link karenge
app.use('/api/auth', require('./routes/auth'));  // /api/auth endpoint banana hai aur wo kaha milegi is mentioned inside require i.e routes folder ke andar auth file.. aur yahi file structure hai kyunki humne auth file kahi aur banayi hai yahi ghuchud muchud nahi kari

app.use('/api/notes', require('./routes/notes'));

app.listen(port, () => {
  console.log(`iNotebook BackEnd listening at http://localhost:${port}`);
})

// pehle 'Example app listening at http://localhost:3000' chalega fir 'Connected to mongo successfully', Kyunki mongo connect hone mein thoda time lega tab tak uske neeche ka code chalne lagega...aur jaise hi connect ho jayega waise hi callback function chal jayega
// Basically asynchronously kaam hoga
