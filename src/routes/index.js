/* 
* This module is used to define the routes for each page, meaning the GET 
* and POST methods for each URL. The routes will link to the Controllers 
* functions to render each page. 
*/

const express = require('express');
const passport = require('passport');

const router = express.Router();

const { Task_List } = require('../models')()

// Importing the controller functions which will render each page. 
const { 
    homePage,
    loginPage,
    registerPage,
    logout
} = require('../controllers')

/* ********************
 * GET and POST routes  
 *********************/

// Our main/index page will be the login page
router.route('/').get(redirectHome, loginPage)
router.route('/register').get(redirectHome, registerPage)
router.route('/home').get(redirectLogin, homePage)

// POST routes
router.route('/api/v1/signin').post(
    // Authetnicate using the passport login strategy
    passport.authenticate('local-login', {
        failureRedirect: '/',
        successRedirect: '/home',
        failureMessage: true
    }, //(err, user, info) => { // This is a callback which accesses the verify (done) function in the passport strategy.
    //         if (err) {
    //             console.log(err)
    //         }   
    //         // TODO: Figure out a way to display the failure message

    //         // Custom Failure Redirect
    //         // else if (info) {
    //         //     module.exports.failureMessage = info.message
    //         //     return res.redirect('/')
    //         // }
    // })
))
    

router.route('/api/v1/signup').post(
    passport.authenticate('local-register', {
        failureRedirect: '/register',
        successRedirect: '/home'
    }),  (err, user, info) => { // This is a callback which accesses the verify (done) function in the passport strategy.
        if (err) {
            console.log(err)
        }   
        // TODO: Figure out a way to display the failure message

        // Custom Failure Redirect
        // else if (info) {
        //     module.exports.failureMessage = info.message
        //     return res.redirect('/')
        // }
})


    // (req, res) => {
    //     // if(req.isAuthenticated()) {
    //     //     req.login(req.user, (err) => {

    //     //         console.log('REQ.LOGIN HAS BEEN CALLED')

    //     //         if (err) { return next(err) }
    //     //     })
    //     // }
    // }

// Logout GET Route
router.route('/logout').post(logout)

/* ********************
 * HELPER FUNCTIONS  
 *********************/


function redirectLogin(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/')
    } else {
        next()
    }
}

function redirectHome(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/home')
        
    } else {
        next()
    }
}

router.route('/testUser').post( (req, res) => {
    if (req.isAuthenticated()) {
        console.log('User is authenticated')
    } else {
        console.log('User is NOT authenticated')
    }

    // console.log(req)

    console.log(req.session.passport)

})


/* ********************
 * TO DO LIST ROUTES
 *********************/

router.route('/taskList/create').post(async (req, res) => {

    try {
        // Create the table
    await Task_List.sync({force: true})

    // Get the user inputted info
    const { taskListName } = req.body

    
    // * Acquring the user id from the current session, which is stored within passport
    const { user } = req.session.passport
    

    // create a new task list. 
    const taskList = await Task_List.create({
        list_name: taskListName,
        user_id: user
    })

    if (taskList) {
        console.log('Task List Created')
    }

    // console.log(taskListName)
    }
    catch(err) {
        if (err) {
            console.log(err)
        }
    }
})

module.exports = router