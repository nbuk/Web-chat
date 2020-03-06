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

let usersCount = 0;

const users = [];

io.on('connection', function(socket) {
    console.log('a user connected');

    
    socket.on('new user logged in', data => {
        
        const { username, nickname } = data;
        const newUser = { username, nickname }

        socket.username = username;
        users.push(newUser);
        console.log(`Users on connect: ${users}`)
        socket.broadcast.emit('new user logged in', { users })
    })

    socket.on('new message', data => {
        console.log(`New message: ${data.message}, timestamp: ${data.messageTimestamp}`);
        socket.broadcast.emit('new message', data);
    })
    
    socket.on('disconnect', function() {
        console.log('user disconnected');
        const username = socket.username;

        for (let user of users) {
            if (user.username === username) {
                users.splice(users.indexOf(user), 1);
            }
        }

        for (let user of users) {
            console.log(`User in users: ${user.username}`);
        }

        socket.broadcast.emit('user disconnected', { users })

    });

    
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
