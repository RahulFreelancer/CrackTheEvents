const {DataTypes } = require('sequelize');
const {sequelize}=require('../utils/dbConnection');


const schema = {
    username:{type: DataTypes.STRING,},
    fullName:{type: DataTypes.STRING,},
    password:{type:DataTypes.STRING},
    wallet:{type:DataTypes.INTEGER},
    role:{type:DataTypes.STRING},
}


const User = sequelize.define('Users',schema);
module.exports=User;

