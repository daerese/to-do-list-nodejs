/* 
* This module is used to define the routes for each page, meaning the GET 
* and POST methods for each URL. The routes will link to the Controllers 
* functions to render each page. 
*/

const express = require('express');
const passport = require('passport');

const router = express.Router();

const { Task_List } = require('../models')()

const hbs = require('hbs');

// const Pjax = require('pjax')

// Importing the controller functions which will render each page. 
const { 
    homePage,
    loginPage,
    registerPage,
    logout,
    taskListPage,
    profilePage
} = require('../controllers')

/* ********************
 * GET and POST routes  
 *********************/

// Our main/index page will be the login page
router.route('/').get(redirectHome, loginPage)
router.route('/register').get(redirectHome, registerPage)
router.route('/home').get(redirectLogin, homePage)

router.route('/profile').get(redirectLogin, profilePage)

router.route('/task-lists/:id').get(redirectLogin, taskListPage)

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
    console.log(req.session)
    console.log('cookie: ', req.session.cookie)

})

/* ********************
 * TO DO LIST ROUTES
 *********************/ 

router.route('/add/task-list').post(async (req, res) => {

    try {
        // Create the table
    await Task_List.sync({})

    // Get the user inputted info
    const { list_name } = req.body

    console.log('The post request, hopefully:', req.body)

    
    // * Acquring the user id from the current session, which is stored within passport
    const { user } = req.session.passport
    
    // create a new task list. 
    const taskList = (await Task_List.create({
        list_name: list_name,
        user_id: user
    }))

    const newTaskList = {list_name: taskList.get('list_name', {plain: true}),
                         list_id: taskList.get('list_id', {plain: true})}


    console.log('TASK LIST: ', newTaskList)

    // Create the array of task lists, or append if it already exists. 
    if (!res.locals.taskLists) {
        res.locals.taskLists = [newTaskList]//[newTaskList.get({plain: true})]
    } else {
        res.locals.taskLists.push(newTaskList)
    }

    // TODO: Register a helper for whichPartial --> Dynamically render partial?

    // // Send a json response contain task list information.
    // res.json([{
    //     task_list_name: newTaskList
    // }])

    res.json(newTaskList)

    // console.log(taskListName)
    }
    catch(err) {
        if (err) {
            console.log(err)
        }
    }
})


// TODO: Create a dynamic route to display the task lists and its tasks
// router.route('/home/task-lists/:list_id').get(redirectLogin, taskListPage)

//Other routes here
router.route('*').get(function(req, res){
    res.send('Sorry, this is wrong URL.');
});

module.exports = router