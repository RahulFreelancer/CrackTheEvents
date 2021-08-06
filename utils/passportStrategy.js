const passport =require('passport')
const local = require('passport-local').Strategy;
const User = require('../dbModels/signupModel');


passport.serializeUser(function(user, done) {
    done(null, user.username);
  });
  
  passport.deserializeUser(async function(username, done) {
      try {
        const user = await User.findOne({ where: {username} });
        if(user){done(null,user) }}
 catch (error) {
done(error,null)}
  });




passport.use(new local(
    async function(username, password, done) {
   
  // checking for username in the database
  try {
    const userPresent = await User.findOne({ where:{username} });

    if (!userPresent) {
        return done(null, false, { message:`No account found with username ${username} ` });
      }
//  comparing password
      if(password!==userPresent.password){
      return  done(null, false, { message: 'Incorrect password.' });
      }

    //   check if password is correct
        return done(null, userPresent);
  } catch (err) {
      return done(err,false)
  }
 
     
    }
  ));

  module.exports