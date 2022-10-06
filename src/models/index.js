const {Sequelize, DataTypes} = require('sequelize');

const sqlize = new Sequelize({
    host: 'localhost',
    database: '',
    username: 'root',
    pass: 'pass',
    dialect: 'mysql'
})
