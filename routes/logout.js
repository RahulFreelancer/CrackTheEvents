const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>{
    if(req.user){
        req.logout();
      return  res.send('logged out ')
    }
    else{
       return res.status(400).end();
    }
})


module.exports=router;
