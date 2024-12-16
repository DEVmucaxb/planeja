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
    }; showWindowDimensions();


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
                        user_uuid: authData.user.id, //id do supabase auth (auth.id)
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
        alert('Seu UUID: ' + auth_uuid);

    };

    async function get_appUserId() {
        if (!auth_uuid) {
            await get_authUuid();
            if (!auth_uuid) { return }; //não está logado

        };

        const { data, error } = await supabase.rpc('get_app_user_id', { parametro_uuid: auth_uuid });

        if (error) {
            console.error("Erro ao chamar função RPC:", error.message);
            return null;
        }
    
        if (data && data.length > 0) {
            console.log("ID obtido:", data[0].id);
            app_user_id = data[0].id;
            sessionStorage.setItem("app_user_id", app_user_id);
            return data[0].id;

        } else {
            console.warn("Nenhum usuário encontrado para o UUID:", uuid);
            return null;
        };
    };


    //funções da homePage
    const homePageFunctions = {
        'getUserEvents': async function () {
            if (!app_user_id) { await get_appUserId() } else {
                const { data } = await supabase.rpc('get_project_summary', { parametro_id:app_user_id });
                console.log(data);
            };
        },
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
        console.log('<homepage>seu uuid: ', auth_uuid);
        console.log('<homepage> seu app_user.id ', app_user_id);

        homePageFunctions.getUserEvents();
    };

});

