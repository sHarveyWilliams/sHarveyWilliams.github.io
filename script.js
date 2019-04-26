document.addEventListener('DOMContentLoaded', Init);

function getHttp(url = 'https://api.punkapi.com/v2/beers?per_page=8&page=1') {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            return response.json()
        })
        .catch(error => console.error('Error:', error))
}

function renderList() {
    getHttp()
        .then(data => {
            const list = document.getElementById('list');

            for (let i = 0; i < data.length; i++) {

                const itemBeer = document.createElement('div');
                itemBeer.setAttribute('class', 'itemBeer');
                itemBeer.setAttribute('id', `itemBeer${i}`);
                if (document.getElementById(`itemBeer${i}`)) {
                    continue;
                } else {
                    const titleElm = document.createElement('div');
                    titleElm.setAttribute('class', 'title');

                    const descriptionElm = document.createElement('div');
                    descriptionElm.setAttribute('class', 'descr');

                    const alcElm = document.createElement('div');

                    const imageElm = document.createElement('img');

                    titleElm.innerText = getInfoBeer(data[i], 'name');
                    descriptionElm.innerText = getInfoBeer(data[i], 'description');
                    imageElm.setAttribute('src', getInfoBeer(data[i], 'image_url'));
                    alcElm.innerText = getInfoBeer(data[i], 'abv');


                    const checkBox = document.createElement('input');
                    checkBox.setAttribute('type', 'checkbox');
                    checkBox.setAttribute('class', 'checkBoxes');

                    if (localStorage.getItem(titleElm.innerText)) {
                        //let check = localStorage.getItem(titleElm.innerText);
                        checkBox.setAttribute('checked', '');
                    }

                    itemBeer.appendChild(titleElm);
                    itemBeer.appendChild(imageElm);
                    itemBeer.appendChild(descriptionElm);
                    itemBeer.appendChild(checkBox);
                    itemBeer.appendChild(alcElm);
                    list.appendChild(itemBeer);

                }
            }

        })
        .catch(error => console.error('Error:', error))
}

function getInfoBeer(item, key) {
    if (key === 'name' || key === 'description' || key === 'image_url' || key === 'abv') {
        return item[key];
    }
}

function checkBoxListener(eventBox) {
    if (eventBox.className != 'checkBoxes') {
        return;
    } else {
        const titleElm = eventBox.parentElement.children[0].innerHTML;
        if (!eventBox.getAttribute('checked', '')) {
            addToLocalStorage(titleElm, 'checked');
            updateList()
            renderList();
        }
    }
}

function updateList() { // проверка на checked
    const data = document.getElementById('list');

    for (let i = 0; i < data.children.length; i++) {
        if (localStorage.getItem(data.children[i].children[0].innerText)) {
            data.children[i].children[3].setAttribute('checked', '');
        }
    }
}

function addToLocalStorage(title, checkbox) {
    if (title) {
        localStorage.setItem(title, (JSON.stringify(checkbox)));
    }
}

function checkAuth() { //проверяем данные для аутентификации пользователя
    const name = document.getElementById('nameInput');
    const email = document.getElementById('emailInput');
    const pass = document.getElementById('passwordInput');
    if (pass.value.length < 8) {
        alert('Пароль должен быть больше 8 симоволов');
        pass.value = '';
    }
    if ((email.value.length === 0) || (name.value.length === 0)) {
        alert('Ввести все данные');
        email.value = '';
        name.value = '';
    }
}

function sortElements(event, listElements, noteAtribute) {
    let arr = [];

    if (noteAtribute === 'title') {
        noteAtribute = 0;
    }
    if (noteAtribute === 'alcohol') {
        noteAtribute = 4;
    }

    for (let i = 0; i < listElements.children.length; i++) {

        arr.push(listElements.children[i].children[noteAtribute].innerHTML);
    }

    arr = sortNameOrNumbers(arr, noteAtribute);
    replaceElements(listElements, arr, noteAtribute)
}

function sortNameOrNumbers(arr, noteAtribute) { //вызываем для различных сортировок
    if (noteAtribute === 0) {
        return arr.sort();
    }
    if (noteAtribute === 4) {
        return arr.sort((elmA, elmB) => {
            return elmA - elmB;
        });
    }
}

function replaceElements(listElements, arr, noteAtribute) { //вызываем для расстановки в соответствии с массивом
    for (let i = 0; i < listElements.children.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (listElements.children[j].children[noteAtribute].innerHTML === arr[i]) {
                listElements.appendChild(listElements.children[j]);
            }
        }
    }

}

function showModalWindow(listElements) {
    if(!document.getElementById('modal')) {
        const modalWindow = document.createElement('div');
        const modalOverlay = document.createElement('div');
        const exitModalWindow = document.createElement('div');

        modalWindow.setAttribute('id', 'modal');
        modalOverlay.setAttribute('id', 'modal-overlay');
        exitModalWindow.setAttribute('id', 'exitModal');

        modalWindow.appendChild(exitModalWindow);
        document.body.appendChild(modalWindow);
        document.body.appendChild(modalOverlay);

        document.getElementById('exitModal').addEventListener('click', event => clearModal(modalWindow, modalOverlay));
        document.getElementById('modal-overlay').addEventListener('click', event => clearModal(modalWindow, modalOverlay));
        addPagination(listElements, modalWindow);
    }
}

function addPagination(listElements, modalWindow) {
    const paganation = document.createElement('div');
    paganation.setAttribute('id', 'pgnt');

    generateElements(paganation, listElements, modalWindow);
}

function generateElements(pagination, listElements, modalWindow) {
    let arrPag = [];
    const curs = document.createElement('div');
    curs.setAttribute('id', 'curs');
    curs.setAttribute('class', 'curs');

    const modalItem = document.createElement('div');
    modalItem.setAttribute('class', 'itemBeerModal');

    for (let i = 0; i < listElements.children.length; i++) {
        let checkElm = listElements.children[i].children[3].getAttribute('checked');
        if (checkElm === '') {
            arrPag.push(listElements.children[i]);
        }
    }
    for (let i = 0; i < arrPag.length; i++) {
        const elmCurs = document.createElement('td');
        elmCurs.innerHTML = i;
        curs.appendChild(elmCurs);
    }
    pagination.appendChild(curs);

    modalWindow.appendChild(pagination);
    modalWindow.appendChild(modalItem);
    document.body.appendChild(modalWindow); //в модальное окно пагинацию??????? //Добавляем

    document.getElementById('curs').addEventListener('click', event => showElmOnPaganation(event.target, modalWindow, arrPag, modalItem))
}

function clearLocalStorage() {
    localStorage.clear();
    updateList();
}

function showElmOnPaganation(event, modalWindow, arrPag, modalItem) { // алгоритм пагинации
    if (event) {
        modalItem.innerHTML = '';
        for (let i = 0; i < arrPag.length; i++) {
            for (let j = 0; j < arrPag.length; j++) {
                if (parseInt(event.innerHTML) === j) {
                    arrPag[j].removeAttribute('class'); //АВТОМАТИЧЕСКОЕ ПЕРЕМЕЩЕНИЕ ЭЛЕМЕНТОВ
                    modalItem.appendChild(arrPag[j]);
                    modalWindow.appendChild(modalItem);
                    renderList();
                }
            }
        }
    }
}

function clearModal(modalWindow, modalOverlay) { //кнопка выхода
    modalWindow.outerHTML='';
    modalOverlay.outerHTML = '';
}

function clearList(listElements) {
    listElements.innerHTML = '';
    renderList();
    clearLocalStorage();
}

function Init() {
    const listElements = document.getElementById('list');
    listElements.addEventListener('click', event => checkBoxListener(event.target));
    document.getElementById('btnBasic').addEventListener('click', checkAuth);
    document.getElementById('clearBtn').addEventListener('click', event => clearList(listElements));
    document.getElementById('sortByNameBtn').addEventListener('click', event => sortElements(event.target, listElements, 'title'));
    document.getElementById('sortByAlcoBtn').addEventListener('click', event => sortElements(event.target, listElements, 'alcohol'));
    document.getElementById('showModalWindow').addEventListener('click', event => showModalWindow(listElements));

    renderList();
}