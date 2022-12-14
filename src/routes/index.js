/* 
* This module is used to define the routes for each page, meaning the GET 
* and POST methods for each URL. The routes will link to the Controllers 
* functions to render each page. 
*/

const express = require('express');
const passport = require('passport');

const router = express.Router();

const { Task_List,
        Task, } = require('../models')()

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
 * UTILITY FUNCTIONS 
 *********************/ 



async function handlePassportDone(err, user, info, req, res, next) {

    // * Error redirect
    if (err) {return next(err)}
    
    // * If there's no error, but no user, then the user is unauthenticated.
    // * They entered invalid credentials. This has to be shown on the front end
    if (!user) {
        console.log('Done info: ', info)
        req.app.locals.message = info.message
        return res.redirect('back')
    }

    // * Custom success redirect

    // * Find the * home task list (its a default list) get its id
    const home = await Task_List.findOne({
        where: {
            user_id: user.id,
            default_list: true
        }
    })

    // * Passport.authenticate calls req.login automatically. But, since we're using a
    // * custom callback function which OVERRIDES passport.authenticate(), we have to call it ourselves.
    req.login(user, function(err) {
        if (err) { return next(err); }

        if (req.app.locals.message) {
            req.app.locals.message = null
        }

        return res.redirect(`/task-lists/${home.list_id}`);
    });

}



/* ********************
 * GET and POST routes  
 *********************/

// Our main/index page will be the login page
router.route('/').get(redirectHome, loginPage)
router.route('/register').get(redirectHome, registerPage)
// router.route('/home').get(redirectLogin, homePage)

router.route('/profile').get(redirectLogin, profilePage)

router.route('/task-lists/:id').get(redirectLogin, taskListPage)

// POST routes
router.route('/api/v1/signin').post( (req, res, next) => {
    
    passport.authenticate('local-login',
     async (err, user, info) => {

        await handlePassportDone(err, user, info, req, res, next)
        // console.log('Callback called?')
        // if (err) {return next(err)}

        // // * If there's no error, but no user, then the user is unauthenticated.
        // // * They entered invalid credentials. This has to be shown on the front end
        // if (!user) {
        //     console.log(req)
        //     return res.redirect('/')
        // }

        // // * Custom success redirect

        // // Find the home task list (its a default list) get its id
        // const home = await Task_List.findOne({
        //     where: {
        //         user_id: user.id,
        //         default_list: true
        //     }
        // })


        // req.login(user, function(err) {
        //     if (err) { return next(err); }
        //     return res.redirect(`/task-lists/${home.list_id}`);
        // });

        // redirect to the route for that task list
        // return res.redirect(`/task-lists/${home.list_id}`)
        // return res.redirect('https://www.passportjs.org/concepts/authentication/middleware/')

    })(req, res, next)

    }
)
    

router.route('/api/v1/signup').post( (req, res, next) => {


    passport.authenticate('local-register',

        async (err, user, info) => {
            await handlePassportDone(err, user, info, req, res, next)
        }

    )(req, res, next)

}

    // passport.authenticate('local-register', {
    //     failureRedirect: '/register',
    //     successRedirect: '/home'
    // })
)

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


    console.log('USER: ', req.user)
    console.log(req.session.passport)
    // console.log(req.session)
    // console.log('cookie: ', req.session.cookie)

})

// * Function for testing: Deletes all the tasks 
router.route('/resetAllTasks').post( async (req, res) => {
    await Task.sync({force: true})
})

/* ********************
 * TO DO LIST ROUTES
 *********************/ 

router.route('/add/task-list').post(async (req, res) => {

    try {
        // Create the table
    await Task_List.sync({})

    // Get the user inputted info
    const { taskListName } = req.body

    // console.log('The post request, hopefully:', req.body)

    
    // * Acquring the user id from the current session, which is stored within passport
    const { user } = req.session.passport
    
    // create a new task list. 
    const taskList = (await Task_List.create({
        list_name: taskListName,
        user_id: user
    })).get({plain: true})

    // const newTaskList = {list_name: taskList.get('list_name', {plain: true}),
    //                      list_id: taskList.get('list_id', {plain: true})}


    // console.log('TASK LIST: ', taskList)

    taskList.current = false;

    // Create the array of task lists, or append if it already exists. 
    if (!req.app.locals.taskLists) {
        req.app.locals.taskLists = [taskList]//[newTaskList.get({plain: true})]
    } else {
        req.app.locals.taskLists.push(taskList)
    }

    // TODO: Register a helper for whichPartial --> Dynamically render partial?

    // // Send a json response contain task list information.
    // res.json([{
    //     task_list_name: newTaskList
    // }])

    // res.json(taskList)

    res.redirect(`/task-lists/${taskList.list_id}`)

    // console.log(taskListName)
    }
    catch(err) {
        if (err) {
            console.log(err)
        }
    }
})


// * Add task Route (from AJAX on HBS page?)
router.route('/add/task').post( async (req, res) => {


    try{
        // Create the table if it doesn't already exist
        await Task.sync({})

        const { user } = req.session.passport
        
        // Acquire the input name of the task.
        // TODO: import other items the user may want: duedate? prior score?
        const { task_name } = req.body
    
        // console.log(task_name)

        if (task_name.trim() == '') {
            return res.status(400).json(null)
        }

        // console.log('WE ARE NOW IN ADD TASK POST: ', req.app.locals)
        // Add the task to the sqlize task model (req.app.locals.currentList.list_id)
        const taskModel = await Task.create({
            task_title: task_name,
            list_id: req.app.locals.currentList.list_id,
            user_id: user
        })
    

        if (taskModel) {
            // If the task data model was successfully created --> 
            // ? Is there a point in adding inputted data to res/app locals if it won't be used? 
            // TODO: Hopefully, we can send back the partial that renders a task instead of the task info. Ajax will then append that.

            if (!req.app.locals.allTasks) {
                req.app.locals.allTasks = [
                    taskModel
                ]
            } else {
                req.app.locals.allTasks.push(taskModel)
            }

            if (!req.app.locals.currentTasks) {
                req.app.locals.currentTasks = [
                    taskModel
                ]
            } else {
                req.app.locals.currentTasks.push(taskModel)
            }

            // console.log(req.app.locals.currentTasks)
            

            // Send back the necessary task info. 
            res.status(201).json(taskModel.get({plain: true}))


        } else {
            return res.status(400).json(null)
        }

    } catch(err) {
        console.log(err)
    }
})


// TODO: router.delete request to complete and delete tasks.
router.route('/delete/task').delete(async (req, res) => {


    try {
        // console.log('\nBEGINNING OF DELETE ROUTE\n');

        const { task_id } = req.body
        // console.log('The current task ID: ', task_id)
        
        // TODO: Remove the task from all locals (req.app.locals)
        
        // * Remove from the object containing all the tasks.
        // console.log(req.app.locals)
        if (req.app.locals.allTasks) {
            // console.log('\nIN DELETE TASKS, ITS STILL DEFINED')
        }

        let taskIndex = req.app.locals.allTasks.findIndex((task) => task.task_id == task_id)
        // console.log('GLobal task index: ', taskIndex)
        req.app.locals.allTasks.splice(taskIndex, 1)

        // * Remove from the object containing the tasks on the current page.
        // console.log(req.app.locals.currentTasks)

        taskIndex = req.app.locals.currentTasks.findIndex((task) => task.task_id == task_id)
        // console.log('Local task index:', taskIndex)
        req.app.locals.currentTasks.splice(taskIndex, 1)

        // * REMOVE THE TASK FROM THE DB
        await Task.destroy({where: {task_id: task_id}})

        // * Send back a response.
        res.status(200).json({success: true})

        // console.log('\nEND OF DELETE TASK ROUTE\n')
    }
    catch (err) {
        console.log(err)
    }

})

router.route('/delete/task-list').delete( async (req, res) => {
    
})



// TODO: Create a dynamic route to display the task lists and its tasks
// router.route('/home/task-lists/:list_id').get(redirectLogin, taskListPage)

//Other routes here
router.route('*').get(function(req, res){
    res.send('Sorry, this is wrong URL.');
});

module.exports = router