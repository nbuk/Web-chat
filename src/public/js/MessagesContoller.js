export default class MessageController {

    static chatList = document.querySelector('.chat-list');
    static chatBody = document.querySelector('.chat-box__body');
    static lastMessageUsername;

    /**
     * Рендерит сообщение на экран
     *
     * @param {object} renderData renderData - обязательный параметр (объект с сообщением).
    */
    createMessage(renderData) {
        if (renderData.type === 'from user') {
            if (MessageController.chatList.children.length) {
                if (MessageController.chatList.lastElementChild.classList.contains('chat-list__from-user')) {
                    MessageController.insertMessageNode(renderData);
                } else {
                    MessageController.insertMessageFromUserNode(renderData)
                }
            } else {
                MessageController.insertMessageFromUserNode(renderData)
            }

            return;
        }

        if (MessageController.lastMessageUsername !== renderData.username) {
            MessageController.insertMessageFromOtherNode(renderData);
            MessageController.chatBody.scrollTop = MessageController.chatBody.scrollHeight;
            
            return;
        }

        if (MessageController.chatList.children.length) {
            if (MessageController.chatList.lastElementChild.classList.contains('chat-list__from-other')) {
                MessageController.insertMessageNode(renderData);
            } else {
                MessageController.insertMessageFromOtherNode(renderData);
            }
        } else {
            MessageController.insertMessageFromOtherNode(renderData);
        }

        MessageController.chatBody.scrollTop = MessageController.chatBody.scrollHeight;
    }

    /**
     * Возвращает render-функцию шаблона
     *
     * @param {string} type тип шаблона (fromOther, fromUser, message)
    */
    static getTemplateRender(type) {
        if (!type) {
            throw new Error('Не указан тип шаблона');
        }

        switch (type) {
            case 'fromOther':
                const messageFromOtherSource = document.querySelector('#message-from-other-template').innerHTML;

                return Handlebars.compile(messageFromOtherSource);
            case 'fromUser':
                const messageFromUserSource = document.querySelector('#message-from-user-template').innerHTML;

                return Handlebars.compile(messageFromUserSource);
            case 'message':
                const messageSource = document.querySelector('#message-template').innerHTML;

                return Handlebars.compile(messageSource);
            default:
                throw new Error('Указан неверный тип');
        }
    }

    static insertMessageFromOtherNode(renderData) {
        const render = MessageController.getTemplateRender('fromOther');
        const html = render(renderData);

        MessageController.chatList.insertAdjacentHTML('beforeend', html);

        MessageController.lastMessageUsername = renderData.username;
    }

    static insertMessageFromUserNode(renderData) {
        const render = MessageController.getTemplateRender('fromUser');
        const html = render(renderData);

        MessageController.chatList.insertAdjacentHTML('beforeend', html);
    }

    static insertMessageNode(renderData) {
        const render = MessageController.getTemplateRender('message');
        const html = render(renderData);
        const messagesDiv = MessageController.chatList.lastElementChild.querySelector('.messages');

        messagesDiv.insertAdjacentHTML('beforeend', html);
    }
}