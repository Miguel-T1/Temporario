async function enviarFormulario() {

    let erros = [];

    document.getElementById("erros").style.display = "none";
    document.getElementById("resultado").style.display = "none";

    let nome = document.getElementById("nome").value.trim();
    let telefone = document.getElementById("telefone").value.trim();
    let cep = document.getElementById("CEP").value.trim();
    let email = document.getElementById("mail").value.trim();
    let senha = document.getElementById("senha").value;
    let confirmarSenha = document.getElementById("confirmarSenha").value;

    let regexTel = /^\d{2} \d{4,5}-\d{4}$/;
    let regexCEP = /^\d{5}-\d{3}$/;
    let regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (nome.split(" ").length < 2) erros.push("Digite nome e sobrenome");
    if (!regexTel.test(telefone)) erros.push("Telefone inválido");
    if (!regexCEP.test(cep)) erros.push("CEP inválido");
    if (!regexEmail.test(email)) erros.push("E-mail inválido");
    if (senha.length < 6) erros.push("Senha deve ter no mínimo 6 caracteres");
    if (senha !== confirmarSenha) erros.push("Senhas não coincidem");

    if (erros.length > 0) {
        document.getElementById("erros").innerHTML = erros.join("<br>");
        document.getElementById("erros").style.display = "block";
        return false;
    }

    const botao = document.querySelector('input[type="submit"]');
    const sucessoDiv = document.getElementById("resultado");
    const erroDiv = document.getElementById("erros");

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
                body: JSON.stringify({
                    name: nome,
                    email: email,
                    phone: telefone.replace(/\D/g, "")
                })
            },
            3
        );

        sucessoDiv.innerHTML = `Parabéns ${nome}, você realizou seu cadastro com o email ${email}. Entraremos em contato através do seu telefone ${telefone}. Você ganhou este prêmio ${resultado.gift}.`;
        sucessoDiv.style.display = "block";

    } catch (erro) {
        erroDiv.innerHTML = erro.message || "Não foi possível concluir o cadastro.";
        erroDiv.style.display = "block";
    } finally {
        botao.disabled = false;
        botao.value = "Enviar";
    }

    return false;
}
async function fetchWithRetry(url, options, tentativas) {
    for (let i = 0; i < tentativas; i++) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error("Erro no servidor");
            }

            return await response.json();

        } catch (erro) {
            if (i === tentativas - 1) throw erro;
        }
    }
}
