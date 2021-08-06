const express = require('express');
const router = express.Router();
const Event = require('../dbModels/createEventModel');
const User = require('../dbModels/signupModel');
const {sequelize}= require('../utils/dbConnection');
const Joi = require('joi');
const event = require('../dbModels/createEventModel');




router.post('/',async(req,res)=>{
if(!req.user){
    return res.send('please login to join the event')
}

      try {
        // check if obj is empty 
        if(Object.keys(req.body).length===0){
            return res.status(400).send('data must be a json or plain javascript object');
         }
         await sequelize.sync();

         if(!req.body.eventId){return res.status(400).send('please mention the eventId key in your query to join the event')}
         if (typeof(req.body.eventId)!=='number'){return res.status(400).send('please enter a valid eventId')}

          

            // creating event 

            // open event db 
            const event = await Event.findOne({where:{id:req.body.eventId}});
            if(!event){return res.send(`no event found with id ${req.body.eventId} `)}
        
            // check if already joined

    if(event.participants.includes(req.user.username)){return res.send('You have already joined this event ')}
            // deducting the event fees
            if(req.user.wallet<event.price){
                return res.send('you dont have enough money to participate in this event')
            }
            const wallet = req.user.wallet-event.price;

            const updateWallet= await User.update({wallet}, {
                where: {
                 id:req.user.id
                }
              });
              req.user.wallet=wallet;

            //   joining the event 
            const participants=[...event.participants,req.user.username];
            const updatedEvent= await Event.update({participants}, {
                where: {
                 id:req.body.eventId
                }});

       return res.send('you have participated successfully');
      } catch (error) {
         return res.status(400).send(error.message);
      }
//   else{res.send('you are not allowed to create an event')}
})


module.exports=router