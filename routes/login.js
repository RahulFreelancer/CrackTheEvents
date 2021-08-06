const express = require('express');
const router = express.Router();
const passport = require('passport');



router.post('/',(req, res, next)=> {
   
    if (req.user) {
       return res.status(400).send(`you are already logged in with username ${req.user.username}`)
    } else {
        next();
    }
},passport.authenticate('local'),(req,res)=>{
    res.send(`logged in with ${req.user.username}` );
})


module.exports=router;