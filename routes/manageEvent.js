const express = require('express');
const router = express.Router();
const Event = require('../dbModels/createEventModel');
const {sequelize}= require('../utils/dbConnection');
const Joi = require('joi');

const validationSchema = {
    name: Joi.string().min(3).max(40).trim().required().label('name').regex(/^[a-zA-Z\s]+$/)
    .error(errors => {
        errors.forEach(err => {
           switch(err.code){
               case 'string.pattern.base':
                err.message =  'name only consist alphabets'
                break;
                default:break;} })
        return errors;
        }),
    startDate: Joi.date().required().label('startDate'),
    endDate: Joi.date().required().label('endDate'),
    status: Joi.boolean().required().label('status'),
    price: Joi.number().required().label('price'),
}
const validation = Joi.object(validationSchema);

const validateEvent=(obj)=>{
 return validation.validate(obj,{ abortEarly: false });}



const authenticateUser=(req,msg)=>{
    if(!req.user){
        return (`You need to login to ${msg} this event`)
    }
    if(req.user.role!=='admin'){
        return 'you are not allowed to create an event'
    }

    return null;
}




// handle read event from db

router.get('/eventList',async(req,res)=>{
    if(req.user){
  
        try {
            const syncing = await sequelize.sync();
            const events = await Event.findAll();
            return events.length==0?res.send('No event published yet'):res.send(events);
        } catch (error) {
           return res.status(501).send(error.message);
        }
 
     }
        else{return res.send('please login to see the events')}
    
})

router.get('/getSingleEvent/:id',async(req,res)=>{
    if(req.user){
        try {
            const syncing = await sequelize.sync();
            const event= await Event.findOne({where:{id:req.params.id}});
           
            return event?res.send(event):res.send(`No event found with id ${req.params.id}`);
        } catch (error) {
           return res.status(501).send(error.message);
        }
 
     }
        else{return res.send('please login to see the event')}
})

router.get('/allParticipants/:eventId',async(req,res)=>{
    if(!req.user){
        return res.send('please login to see all the participants of this event')
    }
    const syncing = await sequelize.sync();
    //  check id
    if(!req.params.eventId){return res.status(400).send('mention the eventId key in your query ')}
    // checking for event 
    try {
        const event = await Event.findOne({where:{id:req.params.eventId}});
        if(!event){return res.send(res.send(`no event found with id ${req.params.eventId} `))}
   if(event.participants.length===0){res.send('this event is not joined by any user yet ')}
        return res.send(event.participants);
    } catch (error) {
        return res.status(400).send(error.message);
    }


    
})

// handle creating new event
router.post('/createNewEvent',async(req,res)=>{
    const notAuthenticate=authenticateUser(req,'create');
    if(notAuthenticate){return res.send(notAuthenticate)}  

      try {
        // check if obj is empty 
        if(Object.keys(req.body).length===0){
            return res.status(400).send('data must be a json or plain javascript object');
         }
        //  validation
         const isValid = validateEvent(req.body);
         if(isValid.error){
             const errArray = isValid.error.details.map((err)=>err.message
             )
             return res.send(errArray)}
            // check if event is already in the db with the same name;
           await sequelize.sync();
            const eventPresent = await Event.findOne({ where: {name:req.body.name } });
            if(eventPresent){return res.send(`cannot create duplicate event with name ${req.body.name}`)}

            // creating event 
        const newEvent = await Event.create({...req.body,participants:[]});
       return res.send(newEvent);
      } catch (error) {return res.status(400).send(error.message);
      }
//   else{res.send('you are not allowed to create an event')}
})


// handle delete event
router.delete('/deleteEvent',async(req,res)=>{
await sequelize.sync();
const notAuthenticate = authenticateUser(req,'delete');
if(notAuthenticate){return res.send(notAuthenticate)};

    if(!req.body.id){return res.status(400).send('please mention the id key in your query')}
    if (typeof(req.body.id)!=='number'){return res.status(400).send('please enter a valid id')}
    try {
    const deleteEvent = await Event.destroy({where:{id:req.body.id}})

    return deleteEvent?res.send(`Event with id ${req.body.id} has been deleted`):res.send(`no event found with id ${req.body.id} `);
   } catch (error) {
       res.status(400).send(error.message);
   }

})


// handle update existing event 

router.put('/updateEvent',async(req,res)=>{
    await sequelize.sync();
    // authentication of user 
    const notAuthenticate = authenticateUser(req,'update');
    if(notAuthenticate){return res.send(notAuthenticate)};
   
        if(!req.body.id){return res.status(400).send('please mention the id key in your query')}
        if (typeof(req.body.id)!=='number'){return res.status(400).send('please enter a valid id')}
      
        // validating inputs
        const isValid = validateEvent(req.body.updatedEventObj||{});
        if(isValid.error){
            const errArray = isValid.error.details.map((err)=>err.message
            )
            return res.send(errArray)}
       
    //    updating the event
        try {
            // checking event in db 
const eventPresentWithThisId=await Event.findOne({where:{id:req.body.id}})
if(!eventPresentWithThisId){return res.send(res.send(`no event found with id ${req.body.id} `))}


// cheking duplicacy with name
            const eventPresent = await Event.findAll();
          
            const duplicateNameFound=eventPresent.find((event)=>{
                return event.dataValues.name==req.body.updatedEventObj.name&&req.body.id!==event.dataValues.id
       })
            

            if(duplicateNameFound){return res.send(`cannot update the event with name ${req.body.updatedEventObj.name}.please provide a unique name`)}
           
           
            const updated= await Event.update({...req.body.updatedEventObj}, {
                where: {
                 id:req.body.id
                }
              });
             
        return res.send(`Event with id ${req.body.id} has been updated`);
       } catch (error) {
           res.status(400).send(error.message);
       }
    
    })

module.exports=router;
