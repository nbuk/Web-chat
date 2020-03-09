var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/main.js', function(req, res) {
    res.sendFile(__dirname + '/public/js/main.js');
});

app.get('/main.css', function(req, res) {
    res.sendFile(__dirname + '/public/css/main.css');
});

app.get('/img/noavatar.jpg', function(req, res) {
    res.sendFile(__dirname + '/public/img/noavatar.jpg');
});

app.get('/img/auth/auth.png', function(req, res) {
    res.sendFile(__dirname + '/public/img/auth/auth.png');
});

///////////////////////

const users = [];

io.on('connection', function(socket) {
    console.log('a user connected');
    
    socket.on('new user logged in', data => {

        const { username } = data;

        socket.username = username;
        users.push(data);
        socket.emit('login', { users })
        socket.broadcast.emit('new user joined', { users })
    })

    socket.on('new message', data => {
        const messageData = {...data, username: socket.username}

        socket.broadcast.emit('new message', messageData);
    })
    
    socket.on('disconnect', function() {
        console.log('user disconnected');
        const username = socket.username;

        for (let user of users) {
            if (user.username === username) {
                users.splice(users.indexOf(user), 1);
            }
        }

        socket.broadcast.emit('user disconnected', { users })
    });

    
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
