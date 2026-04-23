// script.js

const API_URL = "https://backend-node-nmze.onrender.com/register";

const form = document.getElementById("formCadastro");
const errosDiv = document.getElementById("erros");
const resultadoDiv = document.getElementById("resultado");

const nome = document.getElementById("nome");
const telefone = document.getElementById("telefone");
const cep = document.getElementById("CEP");
const email = document.getElementById("mail");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

function mostrarErro(msg) {
  errosDiv.style.display = "block";
  resultadoDiv.style.display = "none";
  errosDiv.innerText = msg;
}

function mostrarSucesso(msg) {
  resultadoDiv.style.display = "block";
  errosDiv.style.display = "none";
  resultadoDiv.innerText = msg;
}

function limparMensagens() {
  errosDiv.style.display = "none";
  resultadoDiv.style.display = "none";
}

function validarNome(nomeValor) {
  const partes = nomeValor.trim().split(" ");
  return partes.length >= 2;
}

function validarTelefone(valor) {
  return /^\d{2} \d{5}-\d{4}$/.test(valor);
}

function validarCEP(valor) {
  return /^\d{5}-\d{3}$/.test(valor);
}

function validarEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function validarSenha(valor) {
  return valor.length >= 6;
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  limparMensagens();

  const nomeVal = nome.value.trim();
  const telefoneVal = telefone.value.trim();
  const cepVal = cep.value.trim();
  const emailVal = email.value.trim();
  const senhaVal = senha.value;
  const confirmarVal = confirmarSenha.value;

  if (!validarNome(nomeVal)) {
    return mostrarErro("Digite nome e sobrenome.");
  }

  if (!validarTelefone(telefoneVal)) {
    return mostrarErro("Telefone deve estar no formato 00 00000-0000");
  }

  if (!validarCEP(cepVal)) {
    return mostrarErro("CEP deve estar no formato 00000-000");
  }

  if (!validarEmail(emailVal)) {
    return mostrarErro("E-mail inválido");
  }

  if (!validarSenha(senhaVal)) {
    return mostrarErro("Senha deve ter no mínimo 6 caracteres");
  }

  if (senhaVal !== confirmarVal) {
    return mostrarErro("As senhas não coincidem");
  }

  const payload = {
    nomeCompleto: nomeVal,
    nome: nomeVal,
    telefone: telefoneVal,
    cep: cepVal,
    email: emailVal,
    senha: senhaVal,
    password: senhaVal
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro na API");
    }

    const gift = data.gift || data.message || "prêmio";

    mostrarSucesso(
      `Parabéns ${nomeVal}, você realizou seu cadastro com o email ${emailVal}, entraremos em contato através do seu telefone ${telefoneVal}, você ganhou este prêmio ${gift}`
    );

  } catch (err) {
    mostrarErro("Erro ao comunicar com a API. Tente novamente.");
    console.error(err);
  }
});
