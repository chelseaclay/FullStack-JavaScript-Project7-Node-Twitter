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
let tweets;
let friends;
let userName;
let profileImage;
let name;
let friendsCount;
let profile_banner_url;
let messages;

const stream = T.stream('statuses/user_timeline');


const getCredentials =  (req, res, next) =>{
    T.get('account/verify_credentials', { skip_status: true })
        .catch(function (err) {
            console.log('caught error at getting credentials', err.stack)
        })
        .then(function (result) {
            let data = result.data;
            userName = data.screen_name;
            profileImage = data.profile_image_url;
            name = data.name;
            friendsCount = data.friends_count;
            profile_banner_url = data.profile_banner_url;
        });
    next();
};
const getTimeline = (req, res, next) => {
    T.get("statuses/user_timeline", { screen_name: userName, count: 5 },
        function(err, data, response) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                tweets = data;
            }

        });
    next();
};

const getFriends = (req, res, next) => {
    T.get("friends/list", { screen_name: userName, count: 5 },
        function(err, data, response) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                friends = data.users;
            }
        });
    next();
};

const getMessages = (req, res, next) => {
    T.get("direct_messages/sent", { count: 5 }, function(err, data, response) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            messages = data;
        }
    });
    next();
};


app.use(getCredentials);
app.get('/', getTimeline, getFriends, getMessages);

app.get('/', (req, res, next) => {
    res.render('index', {
        userName,
        profileImage,
        name,
        friendsCount,
        tweets,
        friends,
        messages,
        profile_banner_url
    });

});



io.on('connection', function (socket) {
    console.log('connected ok');

});

app.post('/', (req, res) => {
    //req.body.tweet is the value of the textarea
    const myTweet = req.body.tweet;
    if(!myTweet || myTweet === ''){
        res.end()
    }
    stream.on('tweet', function (tweet) {
        console.log(tweet); //this is the textarea.value

    });

    T.post('statuses/update', { status: myTweet}, function(err, data, response) {
        console.log(data); //this is what is sent to twitter
        console.log(myTweet);
        if (err) {
            console.log(err);
        }
    });


    //res.send(req.body);
    //console.log(req.body)
});
app.post('/', (req, res) => {
    res.render('index', {
        userName,
        profileImage,
        name,
        friendsCount,
        tweets,
        friends,
        messages,
        profile_banner_url,
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
