// Importando Supabase no escopo superior
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const supabaseUrl = "https://euauwkgudmkyrutimfuk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1YXV3a2d1ZG1reXJ1dGltZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMzYwMjYsImV4cCI6MjA0OTcxMjAyNn0.6tUueIlhyUlSJndKR9gG1sXBpnCMcJtxyEhf4kNprHI";
const supabase = createClient(supabaseUrl, supabaseKey);

//______________________variaveis______________________
//necessário para evitar bugs
let currentPage; //<String>
currentPage = document.body.getAttribute('data-currentPage');
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
            console.log(data);

            let listSize = data.length;
            console.log('tamanho array', listSize); listSize=10;

            for (let i; i < listSize; i++) {
                console.log(data[i]); alert(i)

                const divItem = window.document.createElement('div');
                div.classList.add('event');
                const p = window.document.document.createElement('p');
                pEventName.classList.add('eventName');
                const divSubscore = window.document.createElement('div');
                divSubscore.classList.add('subscore');
                const pPrefix = window.document.createElement('p');
                pPrefix.innerText = 'R$';
                const pSubtotal = window.document.createElement('p');
                pSubtotal.classList.add('subtotal');

                //adicionar tudo ao divItem
                divItem.appendChild(pEventName);
                divItem.appendChild(divSubscore);
                divItem.appendChild(pPrefix);
                divItem.appendChild(pSubtotal);

                eventsSectionEl = document.querySelector('section.eventsSection');
                eventsSectionEl.innerHTML = '';
                eventsSectionEl.appendChild(divItem);
            };


        }
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
        console.log('página atual: ', )
        console.log('<homepage>seu uuid: ', auth_uuid);
        console.log('<homepage> seu app_user.id ', app_user_id);

        homePageFunctions.getUserEvents();
    };

});

