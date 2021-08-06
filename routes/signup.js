const express = require('express');
const router = express.Router();
const User = require('../dbModels/signupModel');
const Joi = require('joi');
const {sequelize}=require('../utils/dbConnection')
const config = require('config');

// input validation schema for joi
const validationSchema = {
    username: Joi.string().alphanum().min(3).max(50).trim().required().label('Username'),
    fullName: Joi.string().trim().max(30).required().label('FullName').regex(/^[a-zA-Z\s]+$/)
    .error(errors => {
        errors.forEach(err => {
           switch(err.code){
               case 'string.pattern.base':
                err.message =  'FullName only consist of alphabets'
                break;
                default:break;} })
        return errors;
        }),
    password: Joi.string().min(6).required().trim().label('Password')
}
const validation = Joi.object(validationSchema);


// input validation function
const validateInput=(obj)=>{

const result =  validation.validate(obj,{ abortEarly: false });
if(obj.password&&obj.password.length>=6){
    const checkAlpha = /[a-zA-Z]+/.test(obj.password);
    const checkNumeric = /[0-9]+/.test(obj.password);
    const checkSpecial=/[!@#$%^&*()_\\-]+/.test(obj.password);
   
    if(!checkAlpha||!checkNumeric||!checkSpecial){
        const passErr ='Password must be alpha numeric with at least one-special character '
        if(result.error){
            result.error.details.push({message:passErr})}
        else{
            result.error={details:[{message:passErr}]} }
 return result; } }
  
 return result
}



router.post('/',async(req,res)=>{
if(req.user){
    return res.status(400).send(`you are currently logged in with username ${req.user.username}.please logout first at /api/logout`)
}
        if(Object.keys(req.body).length===0){
       return res.status(400).send('data must be a json or plain javascript object');
    }
    // validate input 
    const isValid = validateInput(req.body);
if(isValid.error){
    const errArray = isValid.error.details.map((err)=>err.message
    )
    return res.send(errArray)}

    // adding new user to database


    
try {
    const syncing = await sequelize.sync();
    // check if username is already registered;
    const userPresent = await User.findOne({ where: {username:req.body.username } });
    if(userPresent){return res.send(`already registered with username ${req.body.username}`)}
    
    // registring the user
    // NOTE: password will be  saved as  plaint-text but 
    // we should always hash password by using library like bcrypt...
    // this is for demo purpose only 
    const role=(req.body.username===config.get('admin.username')&&
    req.body.password===config.get('admin.password'))?'admin':'user';
    const user = await User.create({...req.body,wallet:5000,role});
  
    return res.send('user has been registered,navigate to /api/login to login');
} catch (e) {
    return res.status(501).end();
}

    
})




module.exports=router;