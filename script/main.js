// Importando Supabase no escopo superior
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const supabaseUrl = "https://euauwkgudmkyrutimfuk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1YXV3a2d1ZG1reXJ1dGltZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMzYwMjYsImV4cCI6MjA0OTcxMjAyNn0.6tUueIlhyUlSJndKR9gG1sXBpnCMcJtxyEhf4kNprHI";
const supabase = createClient(supabaseUrl, supabaseKey);

//______________________variaveis______________________
let authenticated_user_data;



document.addEventListener("DOMContentLoaded", () => {

    //______________________funções______________________
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
        };
        getUserUuid();
    }


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
                ]);

            if (userError) throw new Error(`Erro ao inserir na tabela app_user: ${userError.message}`);

            alert("Usuário registrado com sucesso!"); //retorna null ??
            console.log("Registro criado:", userData); //retorna null ??
            getUserUuid();

        } catch (error) {
            console.error(error.message);
            alert(error.message);
        };
    };


    //função para pegar o uuid do usuário autenticado na tabela auth
    async function getUserUuid() {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Erro ao obter UUID:", error.message);
            return null;
        }
        authenticated_user_data = data;
        console.log(authenticated_user_data); //tá funcionando 
        // [objeto] pra pegar uuid: authenticated_user_data.user.id

        alert('Seu UUID: ' + data.user.id);
    };




    //______________________listeners______________________
    //login
    document.getElementById("login-form").addEventListener("submit", login);


    // registrar usuário
    document.getElementById("signup-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        await registerUser(email, password);

    });

});

// daqui pra cima Ok
