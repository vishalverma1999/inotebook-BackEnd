const express = require('express');   // express imported
const Notes = require('../models/Notes');  //Notes modle imported
const router = express.Router(); // using Router, simce express ke andar ek router hota hai
const fetchuser = require('../middleware/fetchuser');    // importing fetchuser
const { body, validationResult } = require('express-validator');  // validator imported

// ROUTE-1 Get all the notes: GET '/api/notes/fetchallnotes' login required, GET isliye kiya kyunki hume bas header se token lena hai
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        const notes = await Notes.find({ user: req.user.id }); // User model mein jo user ki id's thi unko nikaalo, then {user: id} ho jayega, ab ek aisa field banaya hai humne Notes model mein jaha user object ke andar humne id store kari hai User model ke users ki, uske user id ke corresponding notes jo bhi Notes model mein store hai unhe find karo aur mil jaate hai to notes variable mein store kara do 
        res.json(notes);  
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE-2 Add a new note: POST '/api/notes/addnotes' login required
router.post('/addnotes', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 chars long').isLength({ min: 5 }),
], async (req, res) => {

    try {
        // if there are errors, return the bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {   // agar errors empty nahi hai i.e false to !false i.e true karke if condition chalado
            return res.status(400).json({ errors: errors.array() });  // array of errors will be returned with msg,value,param and location
        }

        // agar koi error nahi hai tab neeche waali cheeze karo
        const { title, description, tag } = req.body;   // jab hum post request maarenge to uski req object ki body mein jo bhjenge usme se title, description and tag nikaallo using destructuring
        const notes = new Notes({
            title, description, tag, user: req.user.id
        });   // ek naya Notes model banado 

        const savedNote = await notes.save();  //database mein save karlo
        res.json([savedNote]);

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
    // AGAR NOTE VALID HAI to user can add the same note multiple times aur ye koi problem nahi hai
})



// ROUTE-3 Update an existing note Using: PUT '/api/notes/updatenote/:id' login required, you can also use post request instead put request
// Alag-alag requests use karne ka ek nebefit hota ha ki hum same endpoint se alag-alag request karke alag-alag kaam kara sakte hain
router.put('/updatenote/:id', fetchuser, async (req, res) => {   // /updatenote/:id --> update the note to the given id

    const { title, description, tag } = req.body;
    
    try {
    // Create a newNote object
    const newNote = {};
    
    // setting newNote keys
    if(title){newNote.title = title};   // newNote object mein title key banado aur uski value set kardo title jise hum req.body se nikal rahe hai
    if(description){newNote.description = description};   // newNote object mein description key banado aur uski value set kardo description jise hum req.body se nikal rahe hai
    if(tag){newNote.tag = tag};   // newNote object mein tag key banado aur uski value set kardo tag jise hum req.body se nikal rahe hai
    // Find the note to be updated and update it
    let notes = await Notes.findById(req.params.id);  // ye us note ki id hai jise aap update karna chahte ho

    // agar is id ka note hi exist na karta ho tab do the below wriiten
    if(!notes){
        res.status(404).send("Not found")   // The HTTP 404 Not Found client error response code indicates that the server can't find the requested resource
    };                                 

    // yaha maanke ke chal rahe hai note to milgaya hai Notes model mein, Ab compare karenge ki kya jo user field mein jo foreign key hai kya wo jo user note update karna chah raha hai uski ki hai,,, user id hume fetchuser middleware mein se mmil jayegi
    if(notes.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }

    notes = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});   // new:true --> agar kuch naya content aata hai to create karne do
    res.json({notes});

} 
catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
   
});



// ROUTE-4 Delete an existing note Using: DELETE '/api/notes/deletenote/:id' login required,
router.delete('/deletenote/:id', fetchuser, async (req, res) => { 
try {
    
 // Find the note to be Deleted and Delete it
    let notes = await Notes.findById(req.params.id);  // ye us note ki id hai jise aap Delete karna chahte ho

    // agar is id ka note hi exist na karta ho tab do the below wriiten
    if(!notes){
        res.status(404).send("Not found")   // The HTTP 404 Not Found client error response code indicates that the server can't find the requested resource
    };                                 

    // yaha maanke ke chal rahe hai note to milgaya hai Notes model mein, Ab compare karenge ki kya jo user field mein jo foreign key hai kya wo jo user note update karna chah raha hai uski ki hai,,, user id hume fetchuser middleware mein se mil jayegi
    if(notes.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }

    notes = await Notes.findByIdAndDelete(req.params.id);  
    res.json({"Success": "Note has been deleted", notes: notes});

} 
catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
   
});


module.exports = router;  // This is written taaki is router ko inde.js mein app.use() ki madad se use kar paayein