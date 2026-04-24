function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxTentativas = 3) {
    let ultimoErro;

    for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
        try {
            const resposta = await fetch(url, options);

            let dadosResposta = {};
            try {
                dadosResposta = await resposta.json();
            } catch {
                dadosResposta = {};
            }

            if (!resposta.ok) {
                const erro = new Error(dadosResposta.message || `Erro HTTP: ${resposta.status}`);
                erro.status = resposta.status;
                throw erro;
            }

            return dadosResposta;

        } catch (erro) {
            ultimoErro = erro;

            if (erro.status >= 400 && erro.status < 500) {
                throw erro;
            }

            if (tentativa < maxTentativas) {
                await esperar(1000);
            } else {
                throw ultimoErro;
            }
        }
    }
}

async function enviarForm(event) {
    event.preventDefault();

    const form = event.target;

    const nome = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const cep = form.cep.value.trim();
    const senha = form.senha.value;
    const senhaAlt = form.senhaAlt.value;

    const erroDiv = document.getElementById("mensagemErro");
    const sucessoDiv = document.getElementById("mensagemSucesso");
    const botao = form.querySelector("button");

    let erros = [];

    const regexTelefone = /^\d{2} \d{5}-\d{4}$/;
    const regexCEP = /^\d{5}-\d{3}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    erroDiv.style.display = "none";
    sucessoDiv.style.display = "none";
    erroDiv.innerHTML = "";
    sucessoDiv.innerHTML = "";

    if (nome.split(/\s+/).length < 2) {
        erros.push("Digite nome e sobrenome.");
    }

    if (!regexTelefone.test(phone)) {
        erros.push('Telefone inválido. Use o formato "00 00000-0000".');
    }

    if (!regexCEP.test(cep)) {
        erros.push('CEP inválido. Use o formato "00000-000".');
    }

    if (!regexEmail.test(email)) {
        erros.push("E-mail inválido.");
    }

    if (senha.length < 6) {
        erros.push("A senha deve ter pelo menos 6 caracteres.");
    }

    if (senha !== senhaAlt) {
        erros.push("As senhas não são iguais.");
    }

    if (erros.length > 0) {
        erroDiv.innerHTML = erros.join("<br>");
        erroDiv.style.display = "block";
        return;
    }

    const dados = {
        name: nome,
        phone: phone,
        cep: cep,
        email: email,
        password: senha,
        confirmPassword: senhaAlt
    };

    try {
        botao.disabled = true;
        botao.textContent = "Enviando...";

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

        sucessoDiv.innerHTML = `Parabéns ${nome}, você realizou seu cadastro com o email ${email}. Entraremos em contato através do seu telefone ${phone}. Você ganhou este prêmio ${resultado.gift}.`;
        sucessoDiv.style.display = "block";

        form.reset();

    } catch (erro) {
        erroDiv.innerHTML = erro.message || "Não foi possível concluir o cadastro.";
        erroDiv.style.display = "block";
    } finally {
        botao.disabled = false;
        botao.textContent = "Cadastrar";
    }
}
