/*
* This is where we define the data models for the database. 

todo: Generate an index on the foreign keys.
*/



// Deferrable is something that will help us with creating Foreign Keys. 
const {DataTypes, Deferrable} = require('sequelize');

const { Sequelize } = require("sequelize-cockroachdb");

const sqlize = new Sequelize(process.env.DATABASE_URL);

// * Connection test to CockroachDB
// (async () => {
//     try {
//       const [results, metadata] = await sqlize.query("SELECT NOW()");
//       console.log(results);
//     } catch (err) {
//       console.error("error executing query:", err);
//     } finally {
//       await sqlize.close();
//     }
//   })();

  



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

                get() {
                    return this.getDataValue('name')
                }
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
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                // autoIncrement: true,
                primaryKey: true,
            },
            // ? There are lists that all users have by default. EX: Home.
            default_list: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false 
            },

            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                required: true,
                // * To help us create a foriegn key 
                references: {
                    // This referneces another model
                    model: 'Users',
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
            priority_score: {
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
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                // autoIncrement: true,
                primaryKey: true,
            }, 
            list_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Task_Lists',
                    key: 'list_id'
                }
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                required: true,
                // * To help us create a foriegn key 
                references: {
                    // This referneces another model
                    model: 'Users',
                    key: 'id',
                    // deferrable: Deferrable.INITIALLY_IMMEDIATE
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
