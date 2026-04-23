const form = document.getElementById("formCadastro");
const errosDiv = document.getElementById("erros");
const resultadoDiv = document.getElementById("resultado");
const botao = document.querySelector('#formCadastro input[type="submit"]');

form.addEventListener("submit", enviarFormulario);

async function enviarFormulario(event) {
    event.preventDefault();

    let erros = [];

    esconderMensagens();

    let nome = document.getElementById("nome").value.trim();
    let telefone = document.getElementById("telefone").value.trim();
    let cep = document.getElementById("CEP").value.trim();
    let email = document.getElementById("mail").value.trim();
    let senha = document.getElementById("senha").value;
    let confirmarSenha = document.getElementById("confirmarSenha").value;

    let telefoneNumeros = telefone.replace(/\D/g, "");
    let regexCEP = /^\d{5}-\d{3}$/;
    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nome.split(/\s+/).length < 2) {
        erros.push("Digite nome e sobrenome.");
    }

    if (telefoneNumeros.length !== 10 && telefoneNumeros.length !== 11) {
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

    if (erros.length > 0) {
        mostrarErro(erros.join("<br>"));
        return;
    }

    try {
        botao.disabled = true;
        botao.value = "Enviando...";

        const response = await fetch("https://backend-node-nmze.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nome,
                email: email,
                phone: telefoneNumeros
            })
        });

        const texto = await response.text();
        console.log("Status:", response.status);
        console.log("Texto bruto da resposta:", texto);

        let dados = {};
        try {
            dados = JSON.parse(texto);
        } catch {
            dados = { raw: texto };
        }

        console.log("JSON convertido:", dados);

        if (!response.ok) {
            throw new Error(
                dados.message ||
                dados.error ||
                "Erro ao enviar cadastro."
            );
        }

        const gift =
            dados.gift ||
            dados.data?.gift ||
            dados.prize ||
            dados.data?.prize ||
            dados.brinde ||
            "prêmio não informado";

        mostrarSucesso(
            `Parabéns ${nome}, você realizou seu cadastro com o email ${email}, entraremos em contato através do seu telefone ${telefone}, você ganhou este prêmio ${gift}.`
        );

    } catch (erro) {
        console.error("Erro completo:", erro);
        mostrarErro(erro.message || "Não foi possível concluir o cadastro.");
    } finally {
        botao.disabled = false;
        botao.value = "Enviar";
    }
}

function esconderMensagens() {
    errosDiv.innerHTML = "";
    resultadoDiv.innerHTML = "";
    errosDiv.style.display = "none";
    resultadoDiv.style.display = "none";
}

function mostrarErro(mensagem) {
    resultadoDiv.style.display = "none";
    resultadoDiv.innerHTML = "";

    errosDiv.innerHTML = mensagem;
    errosDiv.style.display = "block";
}

function mostrarSucesso(mensagem) {
    errosDiv.style.display = "none";
    errosDiv.innerHTML = "";

    resultadoDiv.innerHTML = mensagem;
    resultadoDiv.style.display = "block";
}
