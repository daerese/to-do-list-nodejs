const express = require('express')
const path = require('path')

const app = express()

const PORT = 3000


/******************
 * Middleware
 *******************/

// Set up requests to be in json format
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))

app.set('view engine', 'hbs')


// Views setup 

/***************************************** */

app.get('/', (req, res) => {
    res.render('auth/login')
})

app.get('/register', (req, res) => {
    res.render('auth/register')
})

app.listen(PORT, (err) => {
    console.log(`Listening on port ${PORT}`)
})