const express = require('express');
const app = express();
const passport = require('passport');
const local = require('./utils/passportStrategy');
const session = require('express-session');
const signup = require('./routes/signup');
const manageEvents = require('./routes/manageEvent')
const login = require('./routes/login');
const logout = require('./routes/logout');
const joinEvent = require('./routes/joinEvent');
const {connectDb,sequelize} = require('./utils/dbConnection');

connectDb();
// storing secret here only just for demo purpose
app.use(session({
    secret:'mySecret',
    cookie:{maxAge:9999999},
    saveUninitialized:false,
    resave:false,
}))
app.use(passport.initialize());
app.use(passport.session());
// sequelize.sync();


app.use(express.json());
app.use('/api/signup',signup);
app.use('/api/login',login);
app.use('/api/manageEvents',manageEvents);
app.use('/api/joinEvent',joinEvent)
app.use('/api/logout',logout);

app.listen(3020,()=>console.log('server is listening on port 3020'));
