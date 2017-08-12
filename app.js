const express = require('express');
const bodyParser = require('body-parser');
const Twit = require('twit');
const config = require("./config");
const moment = require('moment');

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.locals.moment = require('moment');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');


const T = new Twit(config);

const getCredentials =  (req, res, next) =>{
    T.get('account/verify_credentials', { skip_status: true })
        .catch(function (err) {
            console.log('caught error at getting credentials', err.stack)
        })
        .then(function (result) {
            let data = result.data;
            req.userName = data.screen_name;
            req.profileImage = data.profile_image_url;
            req.name = data.name;
            req.friendsCount = data.friends_count;
            req.profile_banner_url = data.profile_banner_url;
        });
    setTimeout(next, 1000);
};
const getTimeline = (req, res, next) => {
    T.get("statuses/user_timeline", { screen_name: req.userName, count: 5 },
        function(err, data, response) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                req.tweets = data;
            }

        });
    setTimeout(next, 1000);
};
const getFriends = (req, res, next) => {
    T.get("friends/list", { screen_name: req.userName, count: 5 },
        function(err, data, response) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                req.friends = data.users;
            }
        });
    setTimeout(next, 1000);
};
const getMessages = (req, res, next) => {
    T.get("direct_messages/sent", { count: 5 }, function(err, data, response) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            req.messages = data;
        }
    });
    setTimeout(next, 1000);
};

app.use(getCredentials, getTimeline, getFriends, getMessages);


app.get('/', (req, res, next) => {
    res.render('index', {
        userName: req.userName,
        profileImage: req.profileImage,
        name: req.name,
        friendsCount: req.friendsCount,
        tweets: req.tweets,
        friends: req.friends,
        messages: req.messages,
        profile_banner_url: req.profile_banner_url
    });
    io.on('connection', function (socket) {
        socket.emit('sendUserName', req.userName);
        socket.emit('sendName', req.name);
        socket.emit('sendProfileImage', req.profileImage);
    });
});


io.on('connection', function (socket) {
    socket.on('message', function(newTweetValue){
        console.log(newTweetValue);
        T.post('statuses/update', { status: newTweetValue}, function(err, data, response) {
            if (err) {
                console.log(err);
            }
        });
    });
});


app.use((req, res, next) => {
    let err = new Error('OOOPPPPS Looks like that page doesn\'t exist');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) =>{
    res.locals.error = err;
    res.status(err.status);
    res.render('error');
});

server.listen(3000, function(){
    console.log('listening on *:3000');
});
