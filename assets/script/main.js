// Importando Supabase no escopo superior
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const supabaseUrl = "https://euauwkgudmkyrutimfuk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1YXV3a2d1ZG1reXJ1dGltZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMzYwMjYsImV4cCI6MjA0OTcxMjAyNn0.6tUueIlhyUlSJndKR9gG1sXBpnCMcJtxyEhf4kNprHI";
const supabase = createClient(supabaseUrl, supabaseKey);

//______________________variaveis______________________
//necessário para evitar bugs
let currentPage = document.body.getAttribute('data-currentPage');
console.log('pagina atual ', currentPage);

let auth_uuid = sessionStorage.getItem('auth_uuid') || null;

let app_user_id = sessionStorage.getItem('app_user_id') || null;






document.addEventListener("DOMContentLoaded", () => {

    //______________________funções______________________

    //só pra pegar a largura do celular e do pc
    function showWindowDimensions() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        alert("Largura: " + width + "px, Altura: " + height + "px");
    }; //showWindowDimensions();


    // Função de login
    async function login(e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert("Erro ao logar: " + error.message);
        } else {
            alert("Login bem-sucedido!");
            await get_authUuid();
            await get_appUserId();
            window.location.href = "./homePage.html";
        };
    };


    // Função para registrar o usuário e criar um registro em app_user
    async function registerUser(email, password) {
        try {
            // Etapa 1: Registrar o usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw new Error(`Erro ao registrar usuário: ${authError.message}`);

            // Etapa 2: Criar registro na tabela app_user
            const { data: userData, error: userError } = await supabase
                .from("app_user")
                .insert([
                    {
                        user_uuid: authData.user.id, //id do supabase auth (auth.users.id)
                        user_type: "user"
                    },
                ])
                .select(); // Retorna os dados recém-inseridos;

            if (userError) throw new Error(`Erro ao inserir na tabela app_user_row: ${userError.message}`);

            alert("Usuário registrado com sucesso!");
            console.log("Registro criado na tabela app_user: ", userData);

            app_user_id = userData.id;
            sessionStorage.setItem("app_user_id", app_user_id);

            await get_authUuid();
            window.location.href = "./homePage.html";

        } catch (error) {
            console.error(error.message);
            alert(error.message);
        };
    };


    //função para pegar o uuid do usuário autenticado na tabela auth
    async function get_authUuid() {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Erro ao obter authRow: ", error.message);
            setTimeout(() => {
                window.location.href = "./loginPage.html"
            }, 5000) //aguarda 5s e redireciona
            return null;
        };
        auth_uuid = data.user.id;
        sessionStorage.setItem("auth_uuid", auth_uuid);
        //alert('Seu UUID: ' + auth_uuid);

    };

    async function get_appUserId() {
        if (auth_uuid === '' || auth_uuid === null || auth_uuid === undefined) {
            await get_authUuid();
            if (!auth_uuid) { return }; //não está logado
        };


        /* por algum motivo se não tiver essa função n() dá mais bug do que agora ...F */
        async function n() {
            let { data, error } = await supabase
                .rpc('get_app_user_id', {
                    parametro_uuid: auth_uuid
                });

            app_user_id = data[0].id;
            sessionStorage.setItem("app_user_id", app_user_id);
            console.log("ID obtido do usuário:", app_user_id);
            alert("ID obtido do usuário:", app_user_id);

        }; n();
    };




    //funções da homePage
    const homePageFunctions = {
        'getUserEvents': async function () {
            if (!app_user_id) { await get_appUserId() }
            const { data } = await supabase.rpc('get_project_summary', { parametro_id: app_user_id });

            console.log(`valor enviado como parametro pela getUserEvents = ${app_user_id}`)
            console.log(data);

            const listSize = data.length;
            console.log('tamanho array', listSize);

            if (listSize < 1 || listSize === null || listSize === undefined) { return; };

            const eventsSectionEl = document.querySelector('section.eventsSection');
            eventsSectionEl.innerHTML = '';

            for (let i = 0; i < listSize; i++) {
                console.log(data[i]); console.log(i);

                const divItem = window.document.createElement('div');
                divItem.classList.add('event');
                //depois:
                // divItem.innerHtml = `<div class="event"><p class="eventName">${dada[i].project_name} ..........<p>`

                const pEventName = window.document.createElement('p');
                pEventName.classList.add('eventName');
                pEventName.innerText = `${data[i].project_name}`
                const divSubscore = window.document.createElement('div');
                divSubscore.classList.add('subscore');
                const pPrefix = window.document.createElement('p');
                pPrefix.innerText = 'R$';
                const pSubtotal = window.document.createElement('p');
                pSubtotal.classList.add('subtotal');
                pSubtotal.innerText = `${data[i].subtotal}`;

                divSubscore.appendChild(pPrefix);
                divSubscore.appendChild(pSubtotal);

                //adicionar tudo ao divItem
                divItem.appendChild(pEventName);
                divItem.appendChild(divSubscore);

                eventsSectionEl.appendChild(divItem);
            };


        }
    };


    async function renderProducts() {

        let filter = document.querySelector('#search_input').value;

        if (!filter) { filter = null }; //dá erro se não tiver
        try {
            // Chamada da função RPC no Supabase
            //get the products from supabase by RPC
            const { data, error } = await supabase.rpc('filter_products', { filtro_produtos: filter });

            // Verificação de erros na resposta
            if (error) {
                console.error("Erro ao buscar produtos:", error.message);
                return;
            }
            console.log(data); // for debug

            // limpa todos os elementos dentro da tag <main> no HTML
            const mainElement = document.querySelector('main');
            mainElement.innerHTML = '';

            // render products
            data.forEach(product => {
                const cardItem = document.createElement('div');
                cardItem.classList.add("cardContainer");
                cardItem.innerHTML = `
                        <div class="productCard">
                            <div class="cardMain">
                                <div class="cardImage">
                                    <img src="${product.product_url}" alt="imagem produto">
                                </div>
                                <div class="cardInfo">
                                    <div class="cardName">
                                        <p>${product.nameproduct}</p>
                                    </div>
                                    <div class="cardActions">
                                        <p>R$ ${product.price.toFixed(2)}</p>
                                        <ion-icon name="add-outline"></ion-icon>
                                    </div>
                                </div>
                            </div>
                            <div class="cardDesc">
                                <p class="descProduct">${product.descproduct}</p>
                            </div>
                        </div>`;



                const ionIcon = cardItem.querySelector('ion-icon');

                // Adiciona atributos `data-*` no ícone
                ionIcon.dataset.product_id = product.product_id;
                ionIcon.dataset.supplier_id = product.supplier_id;
                ionIcon.dataset.supplier_company = product.supplier_company;
                ionIcon.dataset.nameproduct = product.nameproduct;

                ionIcon.dataset.descproduct = product.descproduct;
                ionIcon.dataset.price = product.price;
                ionIcon.dataset.product_url = product.product_url;
                ionIcon.dataset.category = product.category;
                ionIcon.dataset.qty_in_store = product.qty_in_store;

                // Adiciona o evento `click` ao ícone
                ionIcon.addEventListener('click', () => {
                    showModal(ionIcon);
                });

                // Adiciona o card ao elemento <main>
                mainElement.appendChild(cardItem);
            });

        } catch (err) {
            console.error("Erro inesperado:", err);
        }
    };

    // add a product in the kart
    function addKart(product_id, supplier_id, supplier_company, nameproduct, descproduct, price, product_url, category, qty_in_store, qty_selected) {
        console.log(`<function addKart> dados recebidos: ${nameproduct}, ${product_url} o usuário quer ${qty_selected} unidades`); // tá funcionando!
    };

    function showModal(dataElement) {
        const product_id = dataElement.getAttribute('data-product_id');
        const supplier_id = dataElement.getAttribute('data-supplier_id');
        const supplier_company = dataElement.getAttribute('data-supplier_company');
        const nameproduct = dataElement.getAttribute('data-nameproduct');
        const descproduct = dataElement.getAttribute('data-descproduct');
        const price = dataElement.getAttribute('data-price');
        const product_url = dataElement.getAttribute('data-product_url');
        const category = dataElement.getAttribute('data-category');
        const qty_in_store = dataElement.getAttribute('data-qty_in_store');

        console.log(`<function showModal> id produto: ${product_id}, id fornecedor: ${supplier_id}, nome empresa: ${supplier_company}, nome produto: ${nameproduct}, descrição: ${descproduct}, preço: ${parseFloat(price).toFixed(2)}, url: ${product_url}, categoria: ${category}, qtde: ${qty_in_store}`);
        // tudo ok daqui pra cima

        // display dialog modal in the screen
        const dialog = document.querySelector('dialog');
        dialog.querySelector('.cardImage').querySelector('img').src = product_url;
        dialog.querySelector('.cardName').querySelector('p').innerText = nameproduct;
        dialog.querySelector('.qty').querySelector('p').innerText = `R$${parseFloat(price).toFixed(2)}`;
        document.querySelector('div.appContainer').classList.add('blur');
        dialog.style.display = 'block';

        // disable dialog
        document.querySelector('input.close_dialog').addEventListener('click', () => {
            document.querySelector('div.appContainer').classList.remove('blur');
            dialog.style.display = 'none';
            dialog.querySelector('input[type="number"]').value = 1;
        });

        document.querySelector('input.confirm_dialog').addEventListener('click', confirmHandler);

        function confirmHandler() {

            // qty that the user wants to buy
            const qty_selected = parseInt(dialog.querySelector('input[type="number"]').value);

            // data to send for addKart function
            addKart(product_id, supplier_id, supplier_company, nameproduct, descproduct, price, product_url, category, qty_in_store, qty_selected);

            // close the dialog
            document.querySelector('div.appContainer').classList.remove('blur');
            dialog.style.display = 'none';
            dialog.querySelector('input[type="number"]').value = 1;

            // impede recursividade
            document.querySelector('input.confirm_dialog').removeEventListener('click', confirmHandler);
        }
    };


    //______________________navbar logic______________________

    //verificar se a navbar está presente na página
    if (['homePage', 'eventsPage', 'productsPage', 'profilePage']
        .includes(currentPage)) {
        //função da bottom navbar
        function changePage(e) {
            console.log(e);
            const pageClicked = e.querySelector('a').getAttribute('data-navbar');
            console.log(pageClicked);
            setTimeout(() => {
                //verificar se a pag clicada é diferente da atual
                if (pageClicked !== currentPage) {
                    console.log('mudando de pagina...');

                    if (pageClicked === 'homePage') {
                        window.location.href = "../pages/homePage.html";
                    };
                    if (pageClicked === 'eventsPage') {
                        //window.location.href = "";
                    };
                    if (pageClicked === 'productsPage') {
                        window.location.href = "../pages/productsPage.html";
                    };
                    if (pageClicked === 'profilePage') {
                        //window.location.href = "";
                    };
                };
            }, 550);
        };


        const listElements = document.querySelectorAll('.list');
        function activeLink() {
            listElements.forEach((item) => {
                item.classList.remove('active');
                this.classList.add('active');
            });
            changePage(this);
        };

        listElements.forEach((item) => {
            item.addEventListener('click', activeLink);
        });
    };



    //______________________listeners______________________
    //________authPages________
    //login
    if (currentPage === 'loginPage') {
        document.getElementById("login-form").addEventListener("submit", login);
    };


    // registrar usuário
    if (currentPage === 'signupPage') {

        document.getElementById("signup-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;

            await registerUser(email, password);

        });
    };



    //________homePage________
    if (currentPage === 'homePage') {
        //code goes here
        console.log('página atual: ', currentPage)
        console.log('<homepage>seu uuid: ', auth_uuid);
        console.log('<homepage> seu app_user.id ', app_user_id);

        homePageFunctions.getUserEvents();
    };

    //________productsPage________
    if (currentPage === 'productsPage') {
        renderProducts();

        // get products by filter
        document.querySelector('#search_button').addEventListener('click', renderProducts);
    };

});

