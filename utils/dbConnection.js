const {Sequelize} = require('sequelize');
const config = require('config');



    

const sequelize = new Sequelize(config.get('dbConfig.database'),
config.get('dbConfig.username'),
config.get('dbConfig.password'),
{logging: false,
    host:config.get('dbConfig.host'),
dialect:config.get('dbConfig.dialect')})

async function connectDb() {
try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }


}

module.exports={sequelize,connectDb};