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

let auth_row = JSON.parse(sessionStorage.getItem('auth_row')); //<objeto> na 1 vez retorna null
// pra pegar uuid: auth_row.user.id

let app_user_row = JSON.parse(sessionStorage.getItem('app_user_row')) //<objeto>







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
            await get_authRow();
            window.location.href = "https://www.youtube.com/";
        };
    };


    // Função para registrar o usuário e criar um registro em app_user_row
    async function registerUser(email, password) {
        try {
            // Etapa 1: Registrar o usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw new Error(`Erro ao registrar usuário: ${authError.message}`);

            // Etapa 2: Criar registro na tabela app_user_row
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
            app_user_row = userData;
            sessionStorage.setItem("app_user_row", JSON.stringify(app_user_row));
            console.log("Registro criado na tabela app_user: ", app_user_row);

            await get_authRow();
            window.location.href = "https://www.youtube.com/";

        } catch (error) {
            console.error(error.message);
            alert(error.message);
        };
    };


    //função para pegar o uuid do usuário autenticado na tabela auth
    async function get_authRow() {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Erro ao obter UUID:", error.message);
            return null;
        }
        auth_row = data;
        sessionStorage.setItem("auth_row", JSON.stringify(auth_row));
        alert('Seu UUID: ' + auth_row.user.id);
        // <objeto> pra pegar uuid: auth_row.user.id

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
    };

});

