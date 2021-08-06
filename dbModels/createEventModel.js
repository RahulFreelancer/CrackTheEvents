const {DataTypes } = require('sequelize');
const {sequelize}=require('../utils/dbConnection');


const schema = {
    name:{type: DataTypes.STRING, allowNull: false},
    startDate:{type: DataTypes.DATE, allowNull: false},
    endDate:{type:DataTypes.DATE, allowNull: false},
    status:{type:DataTypes.STRING, allowNull: false},
    price:{type:DataTypes.INTEGER, allowNull: false},
    participants:{type:DataTypes.ARRAY(DataTypes.STRING)},
}


const event = sequelize.define('events',schema);
module.exports=event;
