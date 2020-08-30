import MessagesConrtoller from './MessagesContoller.js';
import UsersController from './UsersController.js';

window.onload = () => {

    const messageController = new MessagesConrtoller();
    const usersController = new UsersController();

    const socket = io();

    const loginOverlay = document.querySelector('.login-overlay'),
        loginNameInput = loginOverlay.querySelector('#auth__form__name'),
        nicknameInput = loginOverlay.querySelector('#auth__form__nickname'),
        loginForm = loginOverlay.querySelector('#auth__form');

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        login();
    })

    const messageInput = document.querySelector('#message-input'),
        messageForm = document.querySelector('#message-form'),
        chatBody = document.querySelector('.chat-box__body'),
        addAvatarOverlay = document.querySelector('.add-avatar-overlay'),
        menuNode = document.querySelector('#menu'),
        photoInput = document.querySelector('#photoInput'),
        activeUserAvatar = document.querySelector('#active-user-avatar');

    socket.on('new message', data => {
        const renderData = {
            type: 'from other',
            message: data.message, 
            time: getTimeFromTimestamp(data.messageTimestamp), 
            username: data.username,
            avatar: data.avatar
        };

        messageController.createMessage(renderData);
    });

    socket.on('update users', data => {
        usersController.renderActiveUsers(data);
    })

    socket.on('new user joined', data => {
        usersController.renderActiveUsers(data);
    })

    socket.on('login', data => {
        usersController.renderActiveUsers(data);
    })

    socket.on('user update photo', data => {
        usersController.renderActiveUsers(data);
    })

    messageForm.addEventListener('submit', e => {
        e.preventDefault();

        const timestamp = new Date().getTime();

        const messageData = {
            message: messageInput.value,
            messageTimestamp: timestamp
        }

        if (messageInput.value) {
            socket.emit('new message', messageData);

            const renderData = {
                type: 'from user', 
                message: messageInput.value, 
                time: getTimeFromTimestamp(timestamp), 
                avatar: activeUserAvatar.src 
            };

            messageController.createMessage(renderData);

            messageInput.value = '';
        }

        return false;
    });

    menuNode.addEventListener('click', () => {
        addAvatarOverlay.style.display = 'block';
        addAvatarOverlay.style.zIndex = 1;
    })

    addAvatarOverlay.addEventListener('click', e => {
        if (e.target === addAvatarOverlay) {
            addAvatarOverlay.style.display = 'none';
            addAvatarOverlay.style.zIndex = -5;
        }
    })

    photoInput.addEventListener('change', e => {
        const [file] = e.target.files;

        const fileReader = new FileReader();

        fileReader.addEventListener('load', () => {
            activeUserAvatar.src = fileReader.result;

            socket.emit('new photo', fileReader.result);

            addAvatarOverlay.style.display = 'none';
            addAvatarOverlay.style.zIndex = -5;
        })

        if (file) {
            fileReader.readAsDataURL(file);
        }
    })

    function login() {
        const username = loginNameInput.value.replace(/[\s]+/g, '');
        const nickname = nicknameInput.value.replace(/[\s]+/g, '');

        if (username && nickname) {
            socket.emit('new user logged in', { 
                username: loginNameInput.value, 
                nickname: nicknameInput.value
            })
            loginOverlay.style.zIndex = -1;
            loginOverlay.style.display = 'none';

            const activeUserNode = document.querySelector('#active-user');
            const usernameTextContent = `${loginNameInput.value} (Вы)`;
            activeUserNode.querySelector('.user-item__info__username').textContent = usernameTextContent;
            activeUserNode.querySelector('.user-item__info__nickname').textContent = nicknameInput.value;

            const chatHeaderHeight = document.querySelector('.chat-box__header').clientHeight,
                chatFooterHeight = document.querySelector('.chat-box__footer').clientHeight,
                chatBodyHeight = document.body.clientHeight - chatHeaderHeight - chatFooterHeight - 15 + 'px';
            
            chatBody.style.height = chatBodyHeight;
        } else {
            alert('Необходимо заполнить поле с именем и ником')
        }
    }

    function getTimeFromTimestamp(timestamp) {
        let date = new Date(timestamp),
            hours = date.getHours(),
            minutes = date.getMinutes();
        
        if (hours.toString().length < 2) {
            hours = '0' + hours;
        }

        if (minutes.toString().length < 2) {
            minutes = '0' + minutes;
        }

        return `${hours}:${minutes}`;
    }
};
