/*
This is where we will implement the 'LocalStrategy' passport 
for authenticating a user and registring a user. 
*/

// Import necessary packages (Passport, local Strategy)
const LocalStrategy = require('passport-local/lib').Strategy

const passport = require('passport');

const bcrypt = require('bcryptjs');
const validator = require('email-validator');

const { User,
        Task_List,
        Task } = require('../models')() // () means the function will get called to return the User model. 

/***************
 * PASSPORT STRATEGIES FOR LOGIN/REGISTER
 *****************/

module.exports.passportConfig =  async () => {

    // LOCAL STRATEGY FOR LOGIN --> tell passport to use the Local Strategy
    passport.use('local-login', new LocalStrategy(
        {
            usernameField: 'email',
            failureMessage: true,
        },
        async (email, password, done) => {

            try {
                await User.sync({});
                //console.log('PASSPORT LOGIN STRATEGY...')

                // TODO: Display a different message if the user trying to log in doesn't exist. 

                // * Validate the form information
                // * Does the user exist? Is their password a match.
                const user = await User.findOne({ where: {email: email} })

                // * The user exists. Correct Password?
                if (user) {
                    if (bcrypt.compareSync(password, user.password)) {
                        return done(null, user)
                    }
                }

                return done(null, false, {message: 'Invalid Credentials'})

            }
            catch(err) {
                return done(err, false)
            }

        }
    ))

    // LOCAL STRATEGY FOR SIGNUP --> tell passport to use the Local Strategy
    passport.use('local-register', new LocalStrategy(
        {
            usernameField: 'email',
            passReqToCallback: true,
            failureMessage: true,
            // failureRedirect: true
        },
        async (req, email, password, done) => {
            try {

                //console.log('ATTEMPTING REGISTRATION...')
                // Here, take the regular steps to verifying a user's information
                await User.sync({});
                await Task_List.sync({});
                await Task.sync({});

                // Get the name and confirmPassword from the form
                const { name } = req.body
                const {  confirmPassword } = req.body

                let message = 'NO MESSAGE'

                // * Does the user already exist
                if ( await User.findOne( {where: {email: email}}) ) { 
                    message = 'This email address is taken'
                    //console.log('USER EXISTS?')
                }
                // * Valid email address? 
                else if ( !validator.validate(email) ) { 
                    message = 'Enter a valid email address'
                }
                // * Password validity check
                else { 
                    console.log('1. USER NOT FOUND, EMAIL VALID')
                    if ((password.trim()).length >= 8) {
                        // * Is it alphaNumeric?
                        hasNumber = /\d/;
                        console.log('2. PASSWORD IS LONG ENOUGH')
                        if ( hasNumber.test(password) /*&& password == password.toUpperCase()*/ ) {
                            
                            console.log('3. PASSWORD INCLUDES AT LEAST ONE NUMBER')
                            // Do the passwords match
                            if (password.trim() == confirmPassword.trim()) {

                                console.log('4. PASSWORD AND CONFIRM PASSWORD MATCH')
                                // If validation successful, create a new user, hash the password

                                // hash password
                                const salt = await bcrypt.genSalt(8)
                                const hash = await bcrypt.hash(password, salt)
                                
                                // TODO: Create a unique user id for each user
                                const user = (await User.create(
                                    {
                                        name: name,
                                        email: email,
                                        password: hash
                                    }
                                )).get({plain: true})


                                // return done(null, user)
                                if (user) {
                                    //console.log('User successfully created')

                                    // * If the user was successfully created, give them a default home task list.
                                    const home = await Task_List.create({ 
                                        list_name: 'Home',
                                        default_list: true,
                                        user_id: user.id,
                                    })

                                    //console.log('\nUSER REGISTERED, HOME LIST CREATED', home)

                                    return done(null, user)
                                } else {
                                    console.log('Error in registration')
                                }
                            } else {
                                //console.log('PASSWORDS DONT MATCH')
                                message = 'The passwords must match'
                            }
                        } 
                    } else {
                        message = 'The password must be alphanumeric and at least 8 characters'
                        //console.log('PASSWORD INCORRECT?')
                    }
                }
                // Otherwise, the validation failed
                // console.log(message)

                return done(null, false, {message: message})
            }
            catch(err) {
                console.log(err)
                return done(err, false)
            }

        }
    ))
}

// SerializeUser determines which data of the user object should 
// be stored in the session (usually the user id).
passport.serializeUser(async (user, done) => {
    await done(null, user.id)
    //console.log('SERIALIZE USER HAS BEEN CALLED')
})


// Deserialize user is used to find the information associated with 
// the user that's currently logged in (the user object from the db)
passport.deserializeUser(async (id, done) => {
    
    // Find the user with their id 
    const user = await User.findByPk(id)

    if (!user) {
        return done(null, false)
    }
    //console.log('DESERIALIZE USER HAS BEEN CALLED')
    // TODO: Return information for the tasks 
    // Otherwise, return the user information 
    return done(null, user)
})

