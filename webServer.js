/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');


// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost/cs142project8', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user) {
        response.status(401).send('User is not logged in');
        return;
    }

    User.find({}).select("first_name last_name").exec((err, users) => {
            if (err) {
                console.error('Doing /user/list error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            } 

            if (users.length === 0) {
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            console.log("users", users);
            
            response.status(200).send(JSON.parse(JSON.stringify(users)));
        }
    );
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user) {
        response.status(401).send('User is not logged in');
        return;
    }

    var id = request.params.id;
    User.findOne({_id: id}).select("first_name last_name location description occupation favorites").exec((err, user) => {
        if (err) {
            console.error(`Doing /user/:${id} error:`, err);
            response.status(400).send("Invalid user ID: " + id);
            return;
        } 

        response.status(200).send(JSON.parse(JSON.stringify(user)));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user) {
        response.status(401).send('User is not logged in');
        return;
    }

    var id = request.params.id;
    Photo.find({user_id: id}).select("user_id likes comments file_name date_time").exec((photosErr, photos) => {
        if (photosErr) {
            console.error(`Doing /photosOfUser/:${id} error while loading photo:`, photosErr);
            response.status(400).send("Invalid user ID: " + id);
            return;
        }
        
        let photosCopy = JSON.parse(JSON.stringify(photos));
        async.each(photosCopy, (photo, photoCallback) => {
            async.each(photo.comments, (comment, commentsCallback) => {
                User.find({_id: comment.user_id}).select("first_name last_name").exec((userErr, user) => {
                    if (userErr) {
                        console.error(`Doing /photosOfUser/:${id} error while loading comment:`, userErr);
                        response.status(400).send("Invalid user ID: " + id);
                        return;
                    }

                    comment.user = user[0];
                    delete comment.user_id;
                    commentsCallback();
                });
            }, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(`Comments for photo ${photo._id} have been loaded successfully`);
                    photoCallback();
                }
            });
        }, (err) => {
            if (err) {
                console.log(err);
                response.status(400).send("Error occurred while loading photos");
            } else {
                console.log('All photos have been loaded successfully');
                response.status(200).send(JSON.parse(JSON.stringify(photosCopy)));
            }
        });
    });
});

/*
 * URL /admin/login - Send a request to login a user
 */
app.post('/admin/login', (request, response) => {
    let login_name = request.body.login_name;
    let password = request.body.password;

    if (!login_name) { // checking if user is logged in
        if (request.session.user) {
            response.status(200).send(JSON.stringify(request.session.user));
        } else {
            response.status(401).send("user not logged in");
        }
        return;
    }
    User.findOne({ login_name: login_name }, (err, user) => {
            if (err || !user) {
                console.error('Doing /admin/login error:', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (password !== user.password) {
                response.status(400).send("incorrect password");
                return;
            }
            request.session.user = JSON.parse(JSON.stringify(user));
            response.status(200).send(JSON.stringify(user));
        }
    );
});

/*
 * URL /admin/logout - Send a request to logout a user
 */
app.post('/admin/logout', (request, response) => {
    if (request.session.user) {
        request.session.destroy((err) => {
            if (err) {
                console.log(err);
                response.status(400).end();
                return;
            }
            console.log("logged out");
        });
        response.status(200).send("successfully logged out");
    } else {
        response.status(400).send("could not log out");
    }
});

/*
 * URL /commentsOfPhoto/:photo_id - Add a comment to a photo
 */
app.post('/commentsOfPhoto/:photo_id', (request, response) => {
    if (!request.body.comment) {
        response.status(400).send("Empty comment");
        return;
    }
    let comment = {
        comment: request.body.comment,
        date_time: Date.now(),
        user_id: request.session.user._id
    };
    var photo_id = request.params.photo_id;
    Photo.findOne({ _id: photo_id}, (err, photo) => {
        if (err || !photo) {
            console.log("photo not found");
            response.status(400).send(err);
            return;
        }
        photo.comments.push(comment);
        photo.save();
        response.status(200).end();
    });
});


/*
 * URL /photos/new - Upload a photo for the current user
 */
app.post('/photos/new', (request, response) => {
    if (!request.session.user) {
        response.status(401).send("user not logged in");
        return;
    }
    processFormBody (request, response, function (err) {
        // request.file has the following properties of interest:
        //   fieldname    - Should be 'uploadedphoto' since that is what we sent
        //   originalname - The name of the file the user uploaded
        //   mimetype     - The mimetype of the image (e.g., 'image/jpeg',
        //                  'image/png')
        //   buffer       - A node Buffer containing the contents of the file
        //   size         - The size of the file in bytes
    
        if (err || !request.file) {
            response.status(400).send("no file found");
            return;
        }
    
        // We need to create the file in the directory "images" under an unique name.
        // We make the original file name unique by adding a unique prefix with a
        // timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (fileError) {
            // XXX - Once you have the file written into your images directory under the
            // name filename you can create the Photo object in the database
            if (fileError) {
                response.status(400).send("could not write file");
            }
            let photo = new Photo({
                file_name: filename,
                date_time: Date.now(),
                user_id: request.session.user._id,
                likes: [],
                comments: [],
            });
            photo.save();
            response.status(200).end();
        });
    });
});

/*
 * URL /user - Allows a user to register
 */
app.post('/user', (request, response) => {
    if (!request.body.first_name) {
        response.status(400).send("first name cannot be empty");
        return;
    } else if (!request.body.last_name) {
        response.status(400).send("last name cannot be empty");
        return;
    } else if (!request.body.password) {
        response.status(400).send("password cannot be empty");
        return;
    }

    let login_name = request.body.login_name;
    User.findOne({ login_name: login_name }, (err, user) => {
        if (err) {
            response.status(400).send(err);
            return;
        }
        if (!user) {
            let newUser = new User({
                first_name: request.body.first_name,
                last_name: request.body.last_name,
                location: request.body.location,
                description: request.body.description,
                occupation: request.body.occupation,
                login_name: request.body.login_name,
                password: request.body.password,
            });
            newUser.save();
            response.status(200).send("user succesfully registered!");
            return;
        } 
        response.status(400).send("username already exists");
    });
});

/*
 * URL /photos/:photo_id - Update the likes of a photo
 */
app.put('/photos/:photo_id', (req, res) => {
    let photo_id = req.params.photo_id;
    let user_id = req.body.user_id;

    if (!user_id) {
        res.status(400).send("user id not provided");
        return;
    }

    Photo.findOne({ _id: photo_id }, (err, photo) => {
        if (err || !photo) {
            console.log("photo not found");
            res.status(400).send(err);
            return;
        }

        if (photo.likes.includes(user_id)) {  // remove user like
            photo.likes.pull(user_id);
        } else {  // add user like
            photo.likes.push(user_id);
        }
        photo.save();
        res.status(200).end("photo updated");
    });
});

/*
 * URL /user/:id/favorites - Edit the favorites information for User (id)
 */
app.put('/user/:id/favorites', function (request, response) {
    let user_id = request.params.id;
    let photo_id = request.body.photo_id;

    User.findOne({ _id: user_id }, (err, user) => {
        if (err || !user) {
            response.status(400).send(`Doing /user/${user_id}/favorites error`);
            return;
        } 
        if (user.favorites.includes(photo_id)) { // remove user favorite
            user.favorites.pull(photo_id);
        } else { // add user favorite
            user.favorites.push(photo_id);
        }
        user.save();
        response.status(200).end("user updated");
    });
});

/*
 * URL /user/:id/favorites - Get the favorite photos for User (id)
 */
app.get('/user/:id/favorites', function (request, response) {
    let user_id = request.params.id;

    User.findOne({ _id: user_id }, (userErr, user) => {
        if (userErr || !user) {
            response.status(400).send("error finding user", userErr);
            return;
        } 

        Photo.find({ _id: { $in: user.favorites }}).then((photos) => {
            response.status(200).send(photos);
        }).catch((photoErr) => {
            response.status(400).send("error finding photos", photoErr);
        });
    });
});

/*
 * URL /photos/delete/:id - Get the favorite photos for User (id)
 */
app.put('/photos/delete/:id', function (req, res) {
    let photo_id = req.params.id;
    Photo.findOneAndDelete({ _id: photo_id}, (err, photo) => {
        if (err || !photo) {
            console.log("photo not found");
            res.status(400).send(err);
            return;
        }
        res.status(200).end();
    });
});

/*
 * URL /commentsOfPhoto/:photo_id/delete - Delete a comment from a photo
 */
app.put('/commentsOfPhoto/:photo_id/delete', (request, response) => {
    let photo_id = request.params.photo_id;
    let comment_id = request.body.comment_id;
    
    Photo.findOne({ _id: photo_id}, (err, photo) => {
        if (err || !photo) {
            console.log("photo not found");
            response.status(400).send(err);
            return;
        }
        photo.comments = photo.comments.pull({_id: comment_id});
        photo.save();
        response.status(200).end();
    });
});

/*
 * URL /user/:id/delete - Delete a User (id)
 */
app.put('/user/:id/delete', function (request, response) {
    let user_id = request.params.id;

    // Delete all photos by a user
    Photo.deleteMany({ user_id: user_id }, (err) => {
        if (err) {
            console.log("error deleting user photos");
            response.status(400).send(err);
        } else {
            console.log("user photos deleted");
        }
    });

    // Delete all comments by user
    Photo.find({}, (err, photos) => {
        if (err) {
            console.log("error getting photos");
            response.status(400).send(err);
        } else {
            photos.forEach((photo) => {
                photo.comments.pull({user_id: user_id});
                photo.save();
            });
            console.log("user comments deleted");
        }
    });

    // Delete user object
    User.findOneAndDelete({_id: user_id}, (err, user) => {
        if (err || !user) {
            console.log("error deleting user");
            response.status(400).send(err);
            return;
        }
        console.log("user object deleted");
    });

    response.status(200).end();
});



var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


