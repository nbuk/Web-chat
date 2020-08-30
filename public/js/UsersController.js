export default class UsersController {

    static usersListNode = document.querySelector('.users-list');

    /**
     * Рендерит пользователей чата
     *
     * @param {object} data data - обязательный параметр (объект со списком пользователей).
    */
    renderActiveUsers(data) {
        const { users } = data;
        const render = UsersController.getTemplateRender();
        const html = render(users);
        const membersCountNode = document.querySelector('.chat-box__header__members-count');
        membersCountNode.textContent = users.length + ' участника(ов)';

        UsersController.usersListNode.innerHTML = html;
    }

    /**
     * Возвращает render-функцию шаблона
    */
    static getTemplateRender() {
        const usersSource = document.querySelector('#user-template').innerHTML;
        
        return Handlebars.compile(usersSource);
    }
}