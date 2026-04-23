const form = document.getElementById("formCadastro");
const erroDiv = document.getElementById("erros");
const sucessoDiv = document.getElementById("resultado");
const botao = document.querySelector('#formCadastro input[type="submit"]');

form.addEventListener("submit", enviarFormulario);

async function enviarFormulario(event) {
    event.preventDefault();

    erroDiv.style.display = "none";
    sucessoDiv.style.display = "none";
    erroDiv.innerHTML = "";
    sucessoDiv.innerHTML = "";

    let erros = [];

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cep = document.getElementById("CEP").value.trim();
    const email = document.getElementById("mail").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

   let regexTel = /^\(\d{2}\)\s\d{5}-\d{4}$/;
let regexCEP = /^\d{5}-\d{3}$/;
let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (nome.split(/\s+/).length < 2) {
    erros.push("Digite nome e sobrenome.");
}

if (!regexTel.test(telefone)) {
    erros.push("Telefone inválido. Use (00) 00000-0000.");
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
        erroDiv.innerHTML = erros.join("<br>");
        erroDiv.style.display = "block";
        return;
    }

    const dados = {
        name: nome,
        email: email,
        phone: phone
    };

    try {
        botao.disabled = true;
        botao.value = "Enviando...";

        const resultado = await fetchWithRetry(
            "https://backend-node-nmze.onrender.com/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            },
            3
        );

        console.log("Resposta da API:", resultado);

        const gift =
            resultado.gift ||
            resultado.data?.gift ||
            resultado.prize ||
            resultado.data?.prize ||
            "prêmio não informado";

        sucessoDiv.innerHTML = `Parabéns ${nome}, você realizou seu cadastro com o email ${email}. Entraremos em contato através do seu telefone ${phone}. Você ganhou este prêmio ${gift}.`;
        sucessoDiv.style.display = "block";

        form.reset();

    } catch (erro) {
        console.error("Erro:", erro);
        erroDiv.innerHTML = erro.message || "Não foi possível concluir o cadastro.";
        erroDiv.style.display = "block";
    } finally {
        botao.disabled = false;
        botao.value = "Cadastrar";
    }
}

async function fetchWithRetry(url, options, tentativas) {
    let ultimoErro;

    for (let i = 0; i < tentativas; i++) {
        try {
            const response = await fetch(url, options);
            const texto = await response.text();

            let dados;
            try {
                dados = JSON.parse(texto);
            } catch {
                dados = { raw: texto };
            }

            console.log("Status:", response.status);
            console.log("Body:", dados);

            if (!response.ok) {
                throw new Error(
                    dados.message ||
                    dados.error ||
                    dados.raw ||
                    `Erro ${response.status}`
                );
            }

            return dados;
        } catch (erro) {
            ultimoErro = erro;
        }
    }

    throw ultimoErro;
}
