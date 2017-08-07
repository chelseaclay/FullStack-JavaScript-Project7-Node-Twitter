const express = require('express');
const bodyParser = require('body-parser');
const Twit = require('twit');
const config = require("./config");
const moment = require('moment');


const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/static', express.static('css'));
app.use('/static-images', express.static('images'));
app.set('view engine', 'pug');


const T = new Twit(config);

let userName = "";
let name = "";
let profileImage = "";
let myTweet = "";
let retweets = "";
let favourites = "";
let tweets;
let friends;
let messages;
let friendsCount = "";
let profile_banner_url ="";

function loadTweets() {
    T.get("friends/list", { screen_name: userName, count: 5 }, function(
        err,
        data,
        response
    ) {
        if (err) {
            // console.log(err);
            throw err;
        } else {
            friends = data.users;
            // console.log(data.users);
        }
    });

    T.get("direct_messages/sent", { count: 5 }, function(err, data, response) {
        if (err) {
            console.log(err);
        } else {
            messages = data;
             //console.log(data);
        }
    });

    T.get("statuses/user_timeline", { screen_name: userName, count: 5 }, function(
        err,
        data,
        response
    ) {
        if (err) {
            console.log(err);
        } else {
            tweets = data;
            // console.log(data);
        }
    });
}

    T.get('account/verify_credentials', { skip_status: true })
        .catch(function (err) {
            console.log('caught error', err.stack)
        })
        .then(function (result) {
            let data = result.data;
            userName = data.screen_name;
            profileImage = data.profile_image_url;
            name = data.name;
            friendsCount = data.friends_count;
            loadTweets();

        });

io.on("connection", function(socket) {
    console.log("Client connected ...");
    socket.on("input", msg => {
        T.post("statuses/update", { status: msg }, function(err, data, response) {
            if (err) {
                console.log(err);
            }
        });
        setTimeout(function() {
            loadTweets();
        }, 3000);
    });
});




app.get('/', (req, res) => {
    res.render('index', {
        userName: userName,
        profileImage: profileImage,
        name: name,
        friendsCount: friendsCount,
        tweets: tweets,
        friends: friends,
        messages: messages,
        profile_banner_url: profile_banner_url
    });
});




app.post('/', (req, res) => {
    res.json(req.body)

});

server.listen(3000, function(){
    console.log('listening on *:3000');
});
