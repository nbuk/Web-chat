window.onload = () => {

    const socket = io();
    let lastMessageUsername;

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
        chatList = document.querySelector('.chat-list'),
        usersList = document.querySelector('.users-list'),
        messageFromOtherSource = document.querySelector('#message-from-other-template').innerHTML,
        messageFromOtherTemplate = Handlebars.compile(messageFromOtherSource),
        messageFromUserSource = document.querySelector('#message-from-user-template').innerHTML,
        messageFromUserTemplate = Handlebars.compile(messageFromUserSource),
        messageSource = document.querySelector('#message-template').innerHTML,
        messageTemplate = Handlebars.compile(messageSource),
        usersSource = document.querySelector('#user-template').innerHTML,
        usersTemplate = Handlebars.compile(usersSource),
        addAvatarOverlay = document.querySelector('.add-avatar-overlay'),
        menuNode = document.querySelector('#menu'),
        photoInput = document.querySelector('#photoInput'),
        activeUserAvatar = document.querySelector('#active-user-avatar');
    
    const fileReader = new FileReader();

    socket.on('new message', data => {
        const renderData = { 
            message: data.message, 
            time: getTimeFromTimestamp(data.messageTimestamp), 
            username: data.username 
        };

        if (lastMessageUsername !== data.username) {
            createMessageFromOtherNode(renderData);
            chatBody.scrollTop = chatBody.scrollHeight;
            return;
        }

        if (chatList.children.length) {
            if (chatList.lastElementChild.classList.contains('chat-list__from-other')) {
                const html = messageTemplate(renderData);
                const messagesDiv = chatList.lastElementChild.querySelector('.messages');

                messagesDiv.insertAdjacentHTML('beforeend', html);
            } else {
                createMessageFromOtherNode(renderData);
            }
        } else {
            createMessageFromOtherNode(renderData);
        }

        chatBody.scrollTop = chatBody.scrollHeight;
    });

    socket.on('new user joined', data => {
        renderActiveUsers(data);
    })

    socket.on('login', data => {
        renderActiveUsers(data);
    })

    socket.on('user disconnected', data => {
        renderActiveUsers(data);
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

            const renderData = { message: messageInput.value, time: getTimeFromTimestamp(timestamp) };

            if (chatList.children.length) {
                if (chatList.lastElementChild.classList.contains('chat-list__from-user')) {
                    const html = messageTemplate(renderData);
                    const messagesDiv = chatList.lastElementChild.querySelector('.messages');
    
                    messagesDiv.insertAdjacentHTML('beforeend', html);
                } else {
                    createMessageFromUserNode(renderData);
                }
            } else {
                createMessageFromUserNode(renderData);
            }

            messageInput.value = '';
        }

        chatBody.scrollTop = chatBody.scrollHeight;

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

    fileReader.addEventListener('load', () => {
        activeUserAvatar.src = fileReader.result;
    })

    photoInput.addEventListener('change', e => {
        const [file] = e.target.files;

        if (file) {
            fileReader.readAsDataURL(file);
        }
    })

    function renderActiveUsers(data) {
        const { users } = data;
        const html = usersTemplate(users);
        const membersCountNode = document.querySelector('.chat-box__header__members-count');
        membersCountNode.textContent = users.length + ' участника(ов)';

        usersList.innerHTML = html;
    }

    function createMessageFromOtherNode(renderData) {
        const html = messageFromOtherTemplate(renderData);

        chatList.insertAdjacentHTML('beforeend', html);

        lastMessageUsername = renderData.username;
    }

    function createMessageFromUserNode(renderData) {
        const html = messageFromUserTemplate(renderData);

        chatList.insertAdjacentHTML('beforeend', html);
    }

    function login() {
        if (loginNameInput.value && nicknameInput.value) {
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
