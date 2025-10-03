// login.js
// ==================================
// Arquivo de autenticação usando Supabase
// ==================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ===== CONFIGURAÇÃO SUPABASE =====
const SUPABASE_URL = "https://fsihkrurolxtxaisylkf.supabase.co&quot;;   // troque
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaWhrcnVyb2x4dHhhaXN5bGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzAxNDgsImV4cCI6MjA3MjY0NjE0OH0.iybrkPTI6OyUyDjogqLz7o4ye5ifEO1YDBTggCWwnDs";             // troque
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== ELEMENTOS HTML =====
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.pane');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMsg = document.getElementById('authMsg');
const privateArea = document.getElementById('privateArea');
const welcomeUser = document.getElementById('welcomeUser');
const logoutBtn = document.getElementById('logoutBtn');

// ===== FUNÇÕES DE MENSAGEM =====
const showMsg = (text, type = "success") => {
  authMsg.textContent = text;
  authMsg.className = `msg ${type}`;
};
const clearMsg = () => showMsg("");

// ===== TROCA DE ABAS =====
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.pane');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
});


// ===== CADASTRO =====
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();

    const nome = document.getElementById('regNome').value.trim();
    const nascimento = document.getElementById('regNascimento').value || null;
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const telefone = document.getElementById('regTelefone').value.trim();
    const usuario = document.getElementById('regUsuario').value.trim().toLowerCase();
    const senha = document.getElementById('regSenha').value;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { full_name: nome, dob: nascimento, phone: telefone, username: usuario } }
      });

      if (error) return showMsg("Erro ao cadastrar: " + error.message, "error");

      showMsg("Conta criada com sucesso! Verifique seu e-mail.", "success");
      registerForm.reset();
      document.querySelector('.tab[data-tab="login-pane"]').click();
    } catch (err) {
      console.error(err);
      showMsg("Erro inesperado no cadastro.", "error");
    }
  });
}

// ===== LOGIN =====
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();

    const emailOuUser = document.getElementById('loginUser').value.trim().toLowerCase();
    const senha = document.getElementById('loginPass').value;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOuUser,
        password: senha
      });

      if (error) return showMsg("Erro ao entrar: " + error.message, "error");

      showMsg("Login realizado com sucesso!", "success");
      loginForm.reset();
    } catch (err) {
      console.error(err);
      showMsg("Erro inesperado no login.", "error");
    }
  });
}

// ===== CONTROLE DE SESSÃO =====
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    privateArea.classList.remove('hidden');
    welcomeUser.textContent = `Bem-vindo, ${session.user.user_metadata?.full_name || session.user.email}!`;
  } else {
    privateArea.classList.add('hidden');
  }
});

// ===== LOGOUT =====
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showMsg("Você saiu da conta.", "success");
  });
}
