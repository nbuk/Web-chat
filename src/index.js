const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../', 'public')));

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
