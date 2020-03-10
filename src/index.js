var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/main.js', function(req, res) {
    res.sendFile(__dirname + '/public/js/main.js');
});

app.get('/MessagesContoller.js', function(req, res) {
    res.sendFile(__dirname + '/public/js/MessagesContoller.js');
});

app.get('/UsersController.js', function(req, res) {
    res.sendFile(__dirname + '/public/js/UsersController.js');
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

        socket.username = data.username;
        socket.avatar = 'img/noavatar.jpg';
        users.push({...data, id: socket.id, avatar: socket.avatar});
        socket.emit('login', { users })
        socket.broadcast.emit('new user joined', { users })
    })

    socket.on('new photo', data => {
        users.forEach(user => {
            if (user.id === socket.id) {
                socket.avatar = data;
                user.avatar = data;
                socket.emit('update users', {users});
                socket.broadcast.emit('user update photo', { users });
            }
        })

    })

    socket.on('new message', data => {
        const messageData = {...data, username: socket.username, avatar: socket.avatar}

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

        socket.broadcast.emit('update users', { users })
    });

    
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
