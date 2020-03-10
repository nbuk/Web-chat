export default class MessageController {
    
    constructor() {
        this._messageFromOtherRender = this._getTemplate('fromOther');
        this._messageFromUserRender = this._getTemplate('fromUser');
        this._messageRender = this._getTemplate('message');
        this._chatBody = document.querySelector('.chat-box__body');
        this._chatList = document.querySelector('.chat-list');
        this._lastMessageUsername;
    }

    createMessage(renderData) {

        if (renderData.type === 'from user') {
            if (this._chatList.children.length) {
                if (this._chatList.lastElementChild.classList.contains('chat-list__from-user')) {
                    this._insertMessageNode(renderData);
                } else {
                    this._insertMessageFromUserNode(renderData)
                }
            } else {
                this._insertMessageFromUserNode(renderData)
            }

            return;
        }

        if (this._lastMessageUsername !== renderData.username) {
            this._insertMessageFromOtherNode(renderData);
            this._chatBody.scrollTop = this._chatBody.scrollHeight;
            
            return;
        }

        if (this._chatList.children.length) {
            if (this._chatList.lastElementChild.classList.contains('chat-list__from-other')) {
                this._insertMessageNode(renderData);
            } else {
                this._insertMessageFromOtherNode(renderData);
            }
        } else {
            this._insertMessageFromOtherNode(renderData);
        }

        this._chatBody.scrollTop = this._chatBody.scrollHeight;
    }

    /**
     * Возвращает render-функцию шаблона
     *
     * @param {string} type тип шаблона (fromOther, fromUser, message)
    */
    _getTemplate(type) {
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
        }
    }

    _insertMessageFromOtherNode(renderData) {
        const html = this._messageFromOtherRender(renderData);

        this._chatList.insertAdjacentHTML('beforeend', html);

        this._lastMessageUsername = renderData.username;
    }

    _insertMessageFromUserNode(renderData) {
        const html = this._messageFromUserRender(renderData);

        this._chatList.insertAdjacentHTML('beforeend', html);
    }

    _insertMessageNode(renderData) {
        const html = this._messageRender(renderData);
        const messagesDiv = this._chatList.lastElementChild.querySelector('.messages');

        messagesDiv.insertAdjacentHTML('beforeend', html);
    }
}