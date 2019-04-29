document.addEventListener('DOMContentLoaded', Init);

let arrayList = [];
let arrayFilterList = [];
let objListFilter = {};

function getData(numberPage) {
    numberPage = numberPage || 1;

    url = `https://api.punkapi.com/v2/beers?per_page=8&page=${numberPage}`;

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

function getCheckedFromLS() {
    let key;

    for (let i = 0; i < window.localStorage.length; i++) {
        key = localStorage.key(i);
        objListFilter[key] = localStorage.getItem(key);
    }
}

function createDOMElements(array, listElements) {
    listElements = listElements || document.getElementById('list');

    for (let i = 0; i < array.length; i++) {
        const itemBeer = document.createElement('div');
        const titleElm = document.createElement('div');
        const descriptionElm = document.createElement('div');
        const alcElm = document.createElement('div');
        const imageElm = document.createElement('img');
        const checkBox = document.createElement('input');

        itemBeer.setAttribute('class', 'itemBeer');

        titleElm.setAttribute('class', 'title');

        descriptionElm.setAttribute('class', 'descr');
        titleElm.innerText = array[i]['name'];

        descriptionElm.innerText = array[i]['description'];

        imageElm.setAttribute('src', array[i]['image_url']);

        alcElm.setAttribute('class', 'alcElm');
        alcElm.innerText = array[i]['abv'];

        if (objListFilter[titleElm.innerText]) {
            checkBox.setAttribute('checked', '');
        }

        checkBox.setAttribute('type', 'checkbox');
        checkBox.setAttribute('class', 'checkBoxes');

        itemBeer.appendChild(titleElm);
        itemBeer.appendChild(imageElm);
        itemBeer.appendChild(descriptionElm);
        itemBeer.appendChild(checkBox);
        itemBeer.appendChild(alcElm);
        listElements.appendChild(itemBeer);
    }
}

function renderList(numberPage) {
    arrayList = [];

    getData(numberPage)
        .then(data => {
            data.forEach((item) => {
                arrayList.push(item)
            });

            createDOMElements(arrayList);
        })
}

function clearList(listElements) {
    listElements.innerHTML = '';
}

function createPagination(event, listElements, paganationBar) {
    paganationBar.innerHTML = '';

    clearList(listElements);
    renderList(parseInt(event.innerText));
    showNumbersOfPages(paganationBar, +event.innerText);
}

function createPagArr(maxNumberInPag) {
    const pagArr = [];

    for (let i = 1; i <= maxNumberInPag; i++) {
        pagArr.push(i)
    }
    return pagArr;
}

function showNumbersOfPages(paganationBar, page) {

    updateUrl(page);

    if (page < 5) {
        createNumbersInPag(1, 10, paganationBar, page);
    } else {
        createNumbersInPag(page - 4, page, paganationBar, page);
        createNumbersInPag(page, page + 6, paganationBar, page)
    }
}

function createNumbersInPag(page, lastPage, paganationBar, select) {
    const maxNumberInPag = 30;
    const pagArr = createPagArr(maxNumberInPag);

    for (pagArr[page]; page < lastPage; page++) {
        const numberOfPage = document.createElement('td');

        if (page <= 0 || page >= 30) {
            break;
        }

        if(select===page){
            numberOfPage.style.backgroundColor='white';
        }

        numberOfPage.setAttribute('class', 'numberOfPage');
        numberOfPage.innerHTML = page;
        paganationBar.appendChild(numberOfPage);

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

    alert('Все ОК')
}

function sortABVElements(listElements) {
    arrayList.sort((elmA, elmB) => {
        return +elmA['abv'] - +elmB['abv'];
    });

    clearList(listElements);
    createDOMElements(arrayList);
}


function sortTitleElements(listElements) {
    arrayList.sort((elmA, elmB) => {
        let titleA = elmA['name'].toLowerCase();
        let titleB = elmB['name'].toLowerCase();

        if (titleA < titleB) {
            console.log(1);
            return -1;
        }
        if (titleA > titleB) {
            return 1;
        }
        return 0;
    });
    clearList(listElements);
    createDOMElements(arrayList);
}

function checkBoxListener(eventBox) {
    if (eventBox.className != 'checkBoxes') {
        return;
    } else {
        checkBoxAction(eventBox.parentElement.children[0].innerHTML);
    }
}

function checkBoxAction(nameElm) {
    if (!objListFilter[nameElm]) {
        localStorage.setItem(nameElm, 'checked');
        objListFilter[nameElm] = 'checked'
    } else {
        delete objListFilter[nameElm];
        localStorage.removeItem(nameElm);
    }
}

function findChecked() {
    for (let i = 0; i < arrayList.length; i++) {
        if (objListFilter[arrayList[i]['name']]) {
            arrayFilterList.push(arrayList[i]);
        }
    }
}

function addElementsInModal(modalWindow) {
    findChecked();
    createDOMElements(arrayFilterList, modalWindow);
}

function showModalWindow(listElements) {
    if (!document.getElementById('modal')) {
        const modalWindow = document.createElement('div');
        const modalOverlay = document.createElement('div');
        const exitModalWindow = document.createElement('div');

        modalWindow.setAttribute('id', 'modal');
        modalOverlay.setAttribute('id', 'modal-overlay');
        exitModalWindow.setAttribute('id', 'exitModal');

        modalWindow.appendChild(exitModalWindow);
        document.body.appendChild(modalWindow);
        document.body.appendChild(modalOverlay);

        document.getElementById('exitModal').addEventListener('click', event => clearModal(modalWindow, modalOverlay, listElements));
        document.getElementById('modal-overlay').addEventListener('click', event => clearModal(modalWindow, modalOverlay, listElements));

        addElementsInModal(modalWindow);
    }
}

function clearModal(modalWindow, modalOverlay, listElements) { //кнопка выхода
    const numberPage = getURLIdPage();

    modalWindow.outerHTML = '';
    modalOverlay.outerHTML = '';
    clearList(listElements);
    arrayFilterList = [];
    createDOMElements(arrayList, numberPage);
}

function updateUrl(numberPage) {
    const url = new URL(window.location.origin + "/" + "index.html");
    if(numberPage!=1){
        document.title=`Beer Page ${numberPage}`;
    }
    else{
        document.title='Beer';
    }

    if (history.pushState) {
        history.pushState(null, null, url + `?pageID=${numberPage}`);
    } else {
        new Error('Error');
    }
}

function getURLIdPage() {
    const url = new URL("../index.html", window.location);

    return url.searchParams.get("pageID");
}

function Init() {
    const listElements = document.getElementById('list');
    const paganationBar = document.getElementById('pgnt');
    const numberPage = getURLIdPage();

    document.body.addEventListener('click', event => checkBoxListener(event.target));
    document.getElementById('btnBasic').addEventListener('click', checkAuth);
    paganationBar.addEventListener('click', event => createPagination(event.target, listElements, paganationBar));
    //document.getElementById('clearBtn').addEventListener('click', event => clearList(listElements));
    document.getElementById('sortByNameBtn').addEventListener('click', event => sortTitleElements(listElements, 'title'));
    document.getElementById('sortByAlcoBtn').addEventListener('click', event => sortABVElements(listElements, 'alcohol'));
    document.getElementById('showModalWindow').addEventListener('click', event => showModalWindow(listElements));

    getCheckedFromLS();
    renderList();
    console.log(numberPage);
    createNumbersInPag(numberPage, numberPage+10, paganationBar);
    updateUrl(numberPage);
}

