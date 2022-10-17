/*

*/

/*
* Pending tasks:

//TODO: Find a way to attach the user object to request. (It's asynchronous)
//TODO: Route to the correct pages
//TODO: Create protected routes

TODO: Create task models
TODO: Create test todo list page
TODO: Add post rotues for writing/editing tasks

*/


/* *****************
 * Initial Setup
 *******************/
const express = require('express')
const path = require('path')
const session = require('express-session')
const dotenv = require('dotenv').config()

const app = express()

// Setup passport 
const passport = require('passport')

const {
    PORT = 3000,
} = process.env

/* ****************
 * Redis Configuration
 *******************/
// Setup redis store
const connectRedis = require('connect-redis')
const { createClient } = require('redis')

// Create an instance of Connect Redis 
const RedisStore = connectRedis(session)

const redisClient = createClient()
redisClient.connect().catch(console.error);

/* *****************
 * Middleware
 *******************/

// Set up requests to be in json format
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))

// Views setup
app.set('view engine', 'hbs')

// Serving our static files within the public folder
const parentDir = path.resolve(path.dirname(__filename), '..')
const publicPath = path.join(parentDir, 'public')

app.use(express.static(publicPath))

// Setup the session middleware
app.use(session({
    cookie: {
        store: new RedisStore({client: redisClient}),
        sameSite: true,
        secure: false, //False for now while in development
        httpOnly: false, // if true prevent client side JS from reading the cookie
        //set maxAge later
    }, 
    resave: false, // force session to be saved back to session store, even if it wasn't modified during request.
    secret: 'keyboard cat', // TODO: more secure secret
    saveUninitialized: true, // save an unitialized session to the store.
}))

// Initialize passport
app.use(passport.initialize());

// This middleware alters the request object and is able to 
// attach a ‘user’ value that can be retrieved from the session id. 
app.use(passport.session());

// Tell the app to use the router
const router = require('./routes');

app.use(router)

// Configure the passport strategies 
const { passportConfig } = require('./utils/passport')

passportConfig()

// Test the sequelize DB connection. 
// const sqlizeConn = require('./models')

// async function testConnection() {
//     try {
//         await sqlizeConn.authenticate();
//         console.log('Connection has been established successfully.');
//       } catch (error) {
//         console.error('Unable to connect to the database:', error);
//       }
// }

/***************************************** */

app.listen(PORT, (err) => {
    console.log(`Listening on port ${PORT}`)
})