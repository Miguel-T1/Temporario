async function enviarFormulario(event) {
    event.preventDefault();

    let erros = [];

    const errosDiv = document.getElementById("erros");
    const resultadoDiv = document.getElementById("resultado");
    const botao = document.querySelector('input[type="submit"]');

    errosDiv.style.display = "none";
    resultadoDiv.style.display = "none";
    errosDiv.innerHTML = "";
    resultadoDiv.innerHTML = "";

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
        errosDiv.innerHTML = erros.join("<br>");
        errosDiv.style.display = "block";
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

        console.log("Status da resposta:", response.status);

        const dados = await response.json();
        console.log("Resposta completa da API:", dados);

        if (!response.ok) {
            throw new Error(dados.message || dados.error || "Erro ao enviar cadastro.");
        }

        const gift =
            dados.gift ||
            dados.data?.gift ||
            dados.prize ||
            dados.data?.prize ||
            "prêmio não informado";

        resultadoDiv.innerHTML = `Parabéns ${nome}, você realizou seu cadastro com o email ${email}, entraremos em contato através do seu telefone ${telefone}, você ganhou este prêmio ${gift}.`;
        resultadoDiv.style.display = "block";

    } catch (erro) {
        console.error("Erro:", erro);
        errosDiv.innerHTML = erro.message || "Não foi possível concluir o cadastro.";
        errosDiv.style.display = "block";
    } finally {
        botao.disabled = false;
        botao.value = "Enviar";
    }
}
