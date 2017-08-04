const express = require('express');

const app = express();
const Twit = require('twit');

app.use('/static', express.static('css'));

app.set('view engine', 'pug');
app.get('/', (req, res) => {
    res.render('index');

});

const T = new Twit({
    consumer_key:         '...',
    consumer_secret:      '...',
    access_token:         '...',
    access_token_secret:  '...',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

app.get('/hello', (req, res) => {
    res.render('card', {prompt:"who is me", hint: "think"});

});

app.listen(3000);
