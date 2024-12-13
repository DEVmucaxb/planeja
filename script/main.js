// Importando Supabase no escopo superior
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const supabaseUrl = "https://cyngcyawusaktotyfzus.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bmdjeWF3dXNha3RvdHlmenVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NTU4NDUsImV4cCI6MjA0OTMzMTg0NX0.QOGUIm0XEdK58BG8xZji2CV29bsU3dG2idE4bdcv3Ug";
const supabase = createClient(supabaseUrl, supabaseKey);

// Espera o DOM carregar para adicionar os listeners
document.addEventListener("DOMContentLoaded", () => {
    // Função de cadastro
    document.getElementById("signup-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            alert("Erro ao cadastrar: " + error.message);
        } else {
            alert("Usuário criado com sucesso!");
        }
    });

    // Função de login
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert("Erro ao logar: " + error.message);
        } else {
            alert("Login bem-sucedido!");
        }
    });
});
