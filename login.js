// login.js
// =====================================================
// Arquivo de controle do Login/Cadastro (Supabase)
// - Garante que o DOM esteja pronto antes de manipular elementos
// - Remove integração com OAuth/Google (apenas email+senha)
// - Comentários explicativos em cada parte
// =====================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ======= CONFIGURAÇÃO DO SUPABASE =======
// Troque pelos valores do seu projeto Supabase
const SUPABASE_URL = "https://fsihkrurolxtxaisylkf.supabase.co&quot;;   // troque
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaWhrcnVyb2x4dHhhaXN5bGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzAxNDgsImV4cCI6MjA3MjY0NjE0OH0.iybrkPTI6OyUyDjogqLz7o4ye5ifEO1YDBTggCWwnDs";             // troque


// Cria o cliente Supabase (pode ficar em nível de módulo)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================= Utilitários ================= */

// Mostra mensagem na área #authMsg (tipo: "success" ou "error")
const showMsg = (msgEl, text = "", type = "success") => {
  if (!msgEl) return;
  msgEl.textContent = text;
  msgEl.className = `msg ${type}`;
};

// Limpa mensagem
const clearMsg = (msgEl) => showMsg(msgEl, "", "");

/* ================ Inicialização DOM ================= */

// Garantimos que todo o código que usa elementos do HTML só rode
// depois que o DOM estiver pronto.
document.addEventListener("DOMContentLoaded", () => {
  // ===== Seleção de elementos =====
  const tabs = document.querySelectorAll(".tab");
  const panes = document.querySelectorAll(".pane");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMsg = document.getElementById("authMsg");
  const privateArea = document.getElementById("privateArea");
  const welcomeUser = document.getElementById("welcomeUser");
  const logoutBtn = document.getElementById("logoutBtn");

  // ===== Função para alternar abas (Login / Cadastro) =====
  // Verifica existência de elementos antes de vincular eventos.
  if (tabs && panes) {
    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove classe 'active' de todas abas e panes
        tabs.forEach((b) => b.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));

        // Ativa a aba clicada e o pane correspondente
        btn.classList.add("active");
        const targetId = btn.dataset?.tab;
        if (targetId) {
          const target = document.getElementById(targetId);
          if (target) target.classList.add("active");
        }
        // Limpa mensagens ao trocar de aba
        clearMsg(authMsg);
      });
    });
  }

  // ===== Cadastro (sign up) =====
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMsg(authMsg);

      // Captura campos (verifica existência antes)
      const nome = document.getElementById("regNome")?.value.trim() || "";
      const nascimento = document.getElementById("regNascimento")?.value || null;
      const email = (document.getElementById("regEmail")?.value || "").trim().toLowerCase();
      const telefone = document.getElementById("regTelefone")?.value.trim() || "";
      const usuario = (document.getElementById("regUsuario")?.value || "").trim().toLowerCase();
      const senha = document.getElementById("regSenha")?.value || "";

      // Validação mínima
      if (!email || !senha) {
        return showMsg(authMsg, "E-mail e senha são obrigatórios.", "error");
      }

      try {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              full_name: nome,
              dob: nascimento,
              phone: telefone,
              username: usuario,
            },
          },
        });

        if (error) {
          return showMsg(authMsg, "Erro ao cadastrar: " + error.message, "error");
        }

        showMsg(authMsg, "Conta criada com sucesso! Verifique seu e-mail, se necessário.", "success");
        registerForm.reset();

        // Volta para a aba de login (se existir)
        const loginTab = document.querySelector('.tab[data-tab="login-pane"]');
        if (loginTab) loginTab.click();
      } catch (err) {
        console.error("Erro inesperado no cadastro:", err);
        showMsg(authMsg, "Erro inesperado no cadastro.", "error");
      }
    });
  }

  // ===== Login (sign in) =====
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMsg(authMsg);

      const userInput = (document.getElementById("loginUser")?.value || "").trim().toLowerCase();
      const senha = document.getElementById("loginPass")?.value || "";

      if (!userInput || !senha) {
        return showMsg(authMsg, "Preencha e-mail e senha.", "error");
      }

      // Observação: aqui usamos signInWithPassword que exige email.
      // Se o campo permitir "usuário" em vez de email, precisamos
      // de uma lógica extra (consulta na tabela de perfis) — fora do escopo.
      // Então, pedimos que o usuário informe o e-mail.
      if (!userInput.includes("@")) {
        return showMsg(authMsg, "Faça login usando o e-mail (não apenas usuário).", "error");
      }

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: userInput,
          password: senha,
        });

        if (error) {
          return showMsg(authMsg, "Erro ao entrar: " + error.message, "error");
        }

        showMsg(authMsg, "Login realizado com sucesso!", "success");
        loginForm.reset();
      } catch (err) {
        console.error("Erro inesperado no login:", err);
        showMsg(authMsg, "Erro inesperado no login.", "error");
      }
    });
  }

  // ===== Estado de autenticação (mostra/oculta área privada) =====
  // O callback será chamado quando o estado mudar (login/logout/refresh)
  try {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Se houver área privada na página, mostra e preenche nome
        if (privateArea) privateArea.classList.remove("hidden");
        if (welcomeUser) {
          const name = session.user.user_metadata?.full_name || session.user.email || "Usuário";
          welcomeUser.textContent = `Bem-vindo, ${name}!`;
        }
        // limpa mensagem de autenticação ao entrar
        clearMsg(authMsg);
      } else {
        if (privateArea) privateArea.classList.add("hidden");
      }
    });
  } catch (err) {
    // Segurança: caso a versão da lib retorne algo inesperado
    console.warn("Não foi possível registrar onAuthStateChange:", err);
  }

  // ===== Logout =====
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await supabase.auth.signOut();
        showMsg(authMsg, "Você saiu da conta.", "success");
      } catch (err) {
        console.error("Erro ao sair:", err);
        showMsg(authMsg, "Erro ao sair da conta.", "error");
      }
    });
  }

  // Fim do DOMContentLoaded
}); // document.addEventListener("DOMContentLoaded", ...)
