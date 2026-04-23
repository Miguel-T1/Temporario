// script.js (VERSÃO CORRIGIDA COM BASE NO SEU EXEMPLO - 100% COMPATÍVEL COM A API)

const API_URL = "https://backend-node-nmze.onrender.com/register";

const form = document.getElementById("formCadastro");
const erroDiv = document.getElementById("erros");
const sucessoDiv = document.getElementById("resultado");
const botao = form.querySelector("input[type='submit']");

const nome = document.getElementById("nome");
const telefone = document.getElementById("telefone");
const cep = document.getElementById("CEP");
const email = document.getElementById("mail");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

function mostrarErro(msg) {
  erroDiv.style.display = "block";
  sucessoDiv.style.display = "none";
  erroDiv.innerText = msg;
}

function mostrarSucesso(msg) {
  sucessoDiv.style.display = "block";
  erroDiv.style.display = "none";
  sucessoDiv.innerText = msg;
}

function limparMensagens() {
  erroDiv.style.display = "none";
  sucessoDiv.style.display = "none";
}

function formatarTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `${d.slice(0,2)} ${d.slice(2)}`;
  return `${d.slice(0,2)} ${d.slice(2,7)}-${d.slice(7)}`;
}

function formatarCEP(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0,5)}-${d.slice(5)}`;
}

telefone.addEventListener("input", () => {
  telefone.value = formatarTelefone(telefone.value);
});

cep.addEventListener("input", () => {
  cep.value = formatarCEP(cep.value);
});

function validar() {
  if (nome.value.trim().split(" ").length < 2) {
    return "Digite nome e sobrenome";
  }

  if (!/^\d{2} \d{5}-\d{4}$/.test(telefone.value)) {
    return "Telefone inválido (use 00 00000-0000)";
  }

  if (!/^\d{5}-\d{3}$/.test(cep.value)) {
    return "CEP inválido (use 00000-000)";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return "E-mail inválido";
  }

  if (senha.value.length < 6) {
    return "Senha deve ter no mínimo 6 caracteres";
  }

  if (senha.value !== confirmarSenha.value) {
    return "As senhas não coincidem";
  }

  return null;
}

// retry igual ao padrão que você mandou
async function fetchWithRetry(url, options, retries = 3) {
  try {
    const res = await fetch(url, options);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Erro na API");
    }

    return data;
  } catch (err) {
    if (retries > 0) {
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  limparMensagens();

  const erro = validar();
  if (erro) {
    return mostrarErro(erro);
  }

const dados = {
  nomeCompleto: nome.value.trim(),
  email: email.value.trim(),
  phone: telefone.value.trim(),
  cep: cep.value.trim(),
  password: senha.value
};

  try {
    botao.disabled = true;
    botao.textContent = "Enviando...";

    const resultado = await fetchWithRetry(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    }, 3);

    mostrarSucesso(
      `Parabéns ${dados.nome}, você realizou seu cadastro com o email ${dados.email}. Entraremos em contato através do seu telefone ${dados.phone}. Você ganhou este prêmio ${resultado.gift}.`
    );

    form.reset();

  } catch (erro) {
    mostrarErro(erro.message || "Não foi possível concluir o cadastro.");
    console.error(erro);
  } finally {
    botao.disabled = false;
    botao.textContent = "Enviar";
  }
});
