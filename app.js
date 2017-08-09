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
const stream = T.stream('statuses/user_timeline');


T.get('account/verify_credentials', { skip_status: true })
    .catch(function (err) {
        console.log('caught error at getting credentials', err.stack)
    })
    .then(function (result) {
        data = result.data;
        userName = data.screen_name;
        profileImage = data.profile_image_url;
        name = data.name;
        friendsCount = data.friends_count;
        profile_banner_url = data.profile_banner_url;
        loadTweets();

    });



function loadTweets() {
    T.get("friends/list", { screen_name: userName, count: 5 },
        function(err, data, response) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            friends = data.users;
        }
    });

    T.get("direct_messages/sent", { count: 5 }, function(err, data, response) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            messages = data;
        }
    });

    T.get("statuses/user_timeline", { screen_name: userName, count: 5 },
        function(err, data, response) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            tweets = data;
        }
    });
}



io.on('connection', function (socket) {
    console.log('connected ok');

    socket.on('tweet', function (data) {
        T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
            console.log(data)
        });
    });
});


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
    next();
});


app.post('/', (req, res) => {
    res.json(req.body)
});

server.listen(3000, function(){
    console.log('listening on *:3000');
});
