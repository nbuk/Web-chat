export default class UsersController {
    constructor() {
        this._usersListNode = document.querySelector('.users-list');
        this._usersRender = this._getTemplate();
    }

    renderActiveUsers(data) {
        const { users } = data;
        const html = this._usersRender(users);
        const membersCountNode = document.querySelector('.chat-box__header__members-count');
        membersCountNode.textContent = users.length + ' участника(ов)';

        this._usersListNode.innerHTML = html;
    }

    _getTemplate() {
        const usersSource = document.querySelector('#user-template').innerHTML;
        
        return Handlebars.compile(usersSource);
    }
}