//connect socket to the server
const socket = io.connect('http://localhost:3000');
const sendButton = document.getElementsByClassName("button-primary");
const tweet = document.getElementById("tweet-textarea");

    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function(e) {
        e.preventDefault();
        var tweet = tweet.value;
        socket.emit('send', { message: tweet });
        console.log(tweet);
    };

