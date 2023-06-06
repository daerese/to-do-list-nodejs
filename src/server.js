/*

*/

/*
* Pending tasks:

//TODO: Find a way to attach the user object to request. (It's asynchronous)
//TODO: Route to the correct pages
//TODO: Create protected routes

//TODO: Create task models
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

// * Helmet offers protection from web vulnerabilites
// * by setting HTTP headers appropiately.
const helmet = require('helmet')

const livereload = require('livereload')
const connectLivereload = require('connect-livereload')

// To help us use hbs
const hbs = require('hbs')

const app = express()

// Setup passport 
const passport = require('passport')


// Serving our static files within the public folder
const parentDir = path.resolve(path.dirname(__filename), '..')
const publicPath = path.join(parentDir, 'public')

// * to Dynacmically update content in our page
// const liveReloadServer = livereload.createServer().watch(publicPath)


/* ****************
 * Redis Configuration
 *******************/
// Setup redis store
// const connectRedis = require('connect-redis')
// const { createClient } = require('redis')

// Create an instance of Connect Redis 
// const RedisStore = connectRedis(session)

// const redisClient = createClient()
// redisClient.connect().catch(console.error);

/* *****************
 * Middleware
 *******************/

// Set up requests to be in json format
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))

app.use(express.static(publicPath))

// Views setup
app.set('view engine', 'hbs')

// Setup the session middleware
app.set('trust proxy', 1)
app.use(session({
    cookie: {
        // store: new RedisStore({client: redisClient}),
        sameSite: true,
        secure: true, //False for now while in development
        httpOnly: true, // if true prevent client side JS from reading the cookie
        //set maxAge later
        maxAge: 60000 * 60 * 730 // Approx one month
    }, 
    resave: false, // force session to be saved back to session store, even if it wasn't modified during request.
    secret: process.env.SESSION_SECRET, // TODO: more secure secret
    saveUninitialized: true, // save an unitialized session to the store.
}))

// Initialize passport
app.use(passport.initialize());

//*  This middleware alters the request object and is able to 
//*  attach a ‘user’ value that can be retrieved from the session id. 
app.use(passport.session());

// Tell the app to use the router
const router = require('./routes');

app.use(router)

// Configure the passport strategies 
const { passportConfig } = require('./utils/passport')

passportConfig()


// * Setting up helmet and other security options
app.use(helmet())

app.disable('x-powered-by')

/* ****************** 
* HBS Configuration
*********************/
const partialsPath = path.join(parentDir, 'views/partials')
hbs.registerPartials(partialsPath)

// Expose our app to hbs so we can access locals
hbs.localsAsTemplateData(app)


// TODO: Add the partials to app.locals?? Access the partial in a route, send it through res.locals? Render?

/***************************************** */

// app.listen(process.env.PORT, (err) => {
//     console.log(`Listening on port ${process.env.PORT}`)
// })