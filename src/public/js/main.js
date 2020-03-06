window.onload = () => {

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
        sendBtn = document.querySelector('#message-send-btn'),
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
        usersTemplate = Handlebars.compile(usersSource);

    socket.on('new message', data => {
        const renderData = { message: data.message, time: getTimeFromTimestamp(data.messageTimestamp) };

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

    socket.on('new user logged in', data => {
        const { users } = data;
        const html = usersTemplate(users);
        console.log(users);
        const membersCountNode = document.querySelector('.chat-box__header__members-count');
        membersCountNode.textContent = users.length + ' участника(ов)';

        usersList.innerHTML = html;
    })

    socket.on('user disconnected', data => {
        console.log('user disconnected')
        const { users } = data;
        const html = usersTemplate(users);
        console.log(users);
        const membersCountNode = document.querySelector('.chat-box__header__members-count');
        membersCountNode.textContent = users.length + ' участника(ов)';

        usersList.innerHTML = html;
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

    function createMessageFromOtherNode(renderData) {
        const html = messageFromOtherTemplate(renderData);

        chatList.insertAdjacentHTML('beforeend', html);
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
                chatBodyHeight = document.body.clientHeight - chatHeaderHeight - chatFooterHeight + 'px';
            
            chatBody.style.height = chatBodyHeight;
        }
    }

    function getTimeFromTimestamp(timestamp) {
        const date = new Date(timestamp);

        return `${date.getHours()}:${date.getMinutes()}`;
    }
};
