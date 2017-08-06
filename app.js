const express = require('express');
const bodyParser = require('body-parser');
const Twit = require('twit');
const config = require("./config");


const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());



app.use('/static', express.static('css'));
app.use('/static-images', express.static('images'));

app.set('view engine', 'pug');


const T = new Twit(config);

let userName = "";
let name = "";
let profileImage = "";
let tweet = "";
let backgroundImgUrl = "";
let myTweets;
let myFriends;
let myChats;
let friendsCount = "";

    T.get('account/verify_credentials', { skip_status: true })
        .catch(function (err) {
            console.log('caught error', err.stack)
        })
        .then(function (result) {
            let twitter = result.data;
            userName = twitter.screen_name;
            profileImage = twitter.profile_image_url;
            name = twitter.name;
            tweet = twitter.tweet;
            friendsCount = twitter.friends_count;
            console.log(twitter.profile_image_url)

            //console.log('data', result.data);
            T.get("friends/list",
                {screen_name: userName, count: 5},
                function (err, data, response) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    myFriends = data.users;
                    //console.log(data.users);
                }
            });
        });




app.get('/hello', (req, res) => {
    res.render('card', {prompt: 'hello'});
});

app.post('/', (req, res) => {
    //console.dir(req.body)
    res.render('card', {prompt: 'hello'});
});

app.get('/', (req, res) => {
    res.render('index', {
        userName: userName,
        profileImage: profileImage,
        name: name,
        tweet: tweet,
        friendsCount: friendsCount


    });
});




app.post('/', (req, res) => {
    res.json(req.body)

});

app.listen(3000);
