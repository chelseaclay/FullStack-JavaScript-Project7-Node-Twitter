const express = require('express');

const app = express();

app.use('/static', express.static('css'));

app.set('view engine', 'pug');
app.get('/', (req, res) => {
    res.render('index');

});

app.get('/hello', (req, res) => {
    res.render('card', {prompt:"who is me", hint: "think"});

});

app.listen(3000);
