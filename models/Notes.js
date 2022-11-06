const mongoose = require('mongoose');
const { Schema } = mongoose;   // schema banega mongoose model se
const NotesSchema = new Schema({
   
    user: {     // What we want is ki x naam ka user apne hi notes dekh paaye aur kisi ke nahi,,,,,and for that hum ek user field banayenge jisme hum similar to foreign key user model ke object ya user ki id par point kara denge jiski bhi id user field ko milegi,,,,,aur ye sab humne notes route ke find() method mein likha hai  
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'     // refernce model 
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: "General"
    },
    date: {
        type: Date,
        default: Date.now 
    },
  });




// To Use NotesSchema
module.exports = mongoose.model('notes', NotesSchema);     