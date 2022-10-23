/*
* This is where we define the data models for the database. 
*/

// Deferrable is something that will help us with creating Foreign Keys. 
const {Sequelize, DataTypes, Deferrable} = require('sequelize');
const { get } = require('../routes');

const sqlize = new Sequelize({
    host: 'localhost',
    database: 'to_do_list',
    username: 'root',
    password: 'pass',
    dialect: 'mysql'
})

module.exports = () => {

    // Models for the tables in our database. 
    const models = {
        User: sqlize.define('User', {
            id: {
                // type: DataTypes.INTEGER,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // * Generates a UUID
                primaryKey: true,
                // autoIncrement: true // TODO: Generate a more secure user id?
            },
            name: {
                type: DataTypes.STRING,

                // get() {
                //     const rawValue = this.getD
                // }
            },
            email: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.STRING
            }, 
        }),

        // * Task Lists
        Task_List: sqlize.define('Task_List', {
            list_name: {
                type: DataTypes.STRING,
            },
            list_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                required: true,
                // * To help us create a foriegn key 
                references: {
                    // This referneces another model
                    model: 'users',
                    key: 'id',
                    // deferrable: Deferrable.INITIALLY_IMMEDIATE
                }
            }
        }),
        // * Tasks

        Task: sqlize.define('Task', {
            task_title: {
                type: DataTypes.STRING,
                required: true,
                allowNull: false,
            },
            task_description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            proirity_score: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            completed: {
                type: DataTypes.BOOLEAN,
                required: true, 
                allowNull: false,
                defaultValue: false,
            },
            task_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            }, 
            list_id: {
                type: DataTypes.INTEGER,

                references: {
                    model: 'task_lists',
                    key: 'list_id'
                }
            }
        })

        // * Subtasks

        // * Tasks_Tags (Junction Table)

        // * Tags
    }


    // Creating associations (foreign keys) between the models
    // models.User.hasMany(models.Task_List, {foreignKey: 'user_id'})

    // models.Task_List.hasOne(models.User, {foreignKey: 'user_id'})


    return models
}
