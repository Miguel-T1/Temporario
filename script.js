const API_URL = "https://backend-node-nmze.onrender.com/register";


const PAYLOAD_MODE = "A";

const form = document.getElementById("formCadastro");
const erroDiv = document.getElementById("erros");
const sucessoDiv = document.getElementById("resultado");
const botao = form.querySelector('input[type="submit"], button[type="submit"]');

form.addEventListener("submit", enviarFormulario);

async function enviarFormulario(event) {
  event.preventDefault();

  limparMensagens();

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const cep = document.getElementById("CEP").value.trim();
  const email = document.getElementById("mail").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  const phone = telefone.replace(/\D/g, "");

  const erros = validarCampos({
    nome,
    phone,
    cep,
    email,
    senha,
    confirmarSenha
  });

  if (erros.length > 0) {
    mostrarErro(erros.join("<br>"));
    return;
  }

  const dados = montarPayload({
    nome,
    email,
    phone,
    senha
  });

  console.log("Payload mode:", PAYLOAD_MODE);
  console.log("Dados enviados:", dados);

  try {
    setBotaoEstado(true, "Enviando...");

    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(dados)
    });

    const texto = await response.text();

    console.log("Status:", response.status);
    console.log("Headers da resposta:", Object.fromEntries(response.headers.entries()));
    console.log("Resposta bruta:", texto);

    let resultado;
    try {
      resultado = texto ? JSON.parse(texto) : {};
    } catch {
      resultado = { raw: texto };
    }

    console.log("Resposta convertida:", resultado);

    if (!response.ok) {
      throw new Error(
        resultado.message ||
        resultado.error ||
        resultado.raw ||
        `HTTP ${response.status}`
      );
    }

    const gift =
      resultado.gift ??
      resultado.data?.gift ??
      resultado.prize ??
      resultado.data?.prize ??
      resultado.brinde ??
      resultado.data?.brinde ??
      "prêmio não informado";

    mostrarSucesso(
      `Parabéns ${nome}, você realizou seu cadastro com o email ${email}. ` +
      `Entraremos em contato através do seu telefone ${formatarTelefone(phone)}. ` +
      `Você ganhou este prêmio ${gift}.`
    );

    form.reset();
  } catch (erro) {
    console.error("Erro completo:", erro);
    mostrarErro(erro.message || "Não foi possível concluir o cadastro.");
  } finally {
    setBotaoEstado(false, "Enviar");
  }
}

function validarCampos({ nome, phone, cep, email, senha, confirmarSenha }) {
  const erros = [];

  const regexCEP = /^\d{5}-\d{3}$/;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (nome.split(/\s+/).length < 2) {
    erros.push("Digite nome e sobrenome.");
  }

  if (phone.length !== 10 && phone.length !== 11) {
    erros.push("Telefone inválido. Digite com DDD e 10 ou 11 números.");
  }

  if (!regexCEP.test(cep)) {
    erros.push("CEP inválido. Use 00000-000.");
  }

  if (!regexEmail.test(email)) {
    erros.push("E-mail inválido.");
  }

  if (senha.length < 6) {
    erros.push("A senha deve ter no mínimo 6 caracteres.");
  }

  if (senha !== confirmarSenha) {
    erros.push("As senhas não coincidem.");
  }

  return erros;
}

function montarPayload({ nome, email, phone, senha }) {
  const payloads = {
    A: {
      name: nome,
      email: email,
      phone: phone
    },
    B: {
      name: nome,
      email: email,
      phone: phone,
      password: senha
    },
    C: {
      nome: nome,
      email: email,
      telefone: phone,
      senha: senha
    }
  };

  return payloads[PAYLOAD_MODE];
}

function formatarTelefone(num) {
  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  }

  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  }

  return num;
}

function limparMensagens() {
  erroDiv.innerHTML = "";
  sucessoDiv.innerHTML = "";
  erroDiv.style.display = "none";
  sucessoDiv.style.display = "none";
}

function mostrarErro(mensagem) {
  sucessoDiv.innerHTML = "";
  sucessoDiv.style.display = "none";

  erroDiv.innerHTML = mensagem;
  erroDiv.style.display = "block";
}

function mostrarSucesso(mensagem) {
  erroDiv.innerHTML = "";
  erroDiv.style.display = "none";

  sucessoDiv.innerHTML = mensagem;
  sucessoDiv.style.display = "block";
}

function setBotaoEstado(disabled, texto) {
  if (!botao) return;

  botao.disabled = disabled;

  if (botao.tagName === "INPUT") {
    botao.value = texto;
  } else {
    botao.textContent = texto;
  }
}
