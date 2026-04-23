async function enviarFormulario() {

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

   
    let regexTel = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      let regexCEP = /^\d{5}-\d{3}$/;
    let regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


    if (nome.split(/\s+/).length < 2)
        erros.push("Digite nome e sobrenome.");

    if (!regexTel.test(telefone))
        erros.push("Telefone inválido. Use (00) 00000-0000.");

    if (!regexCEP.test(cep))
        erros.push("CEP inválido. Use 00000-000.");

    if (!regexEmail.test(email))
        erros.push("E-mail inválido.");

    if (senha.length < 6)
        erros.push("A senha deve ter no mínimo 6 caracteres.");

    if (senha !== confirmarSenha)
        erros.push("As senhas não coincidem.");

   
    if (erros.length > 0) {
        errosDiv.innerHTML = erros.join("<br>");
        errosDiv.style.display = "block";
        return false;
    }

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
                    phone: telefone 
                })
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

        resultadoDiv.innerHTML =
            `Parabéns ${nome}, você realizou seu cadastro com o email ${email}, ` +
            `entraremos em contato através do seu telefone ${telefone}, ` +
            `você ganhou este prêmio ${gift}.`;

        resultadoDiv.style.display = "block";

    } catch (erro) {
        console.error("Erro completo:", erro);

        errosDiv.innerHTML =
            erro.message || "A API está indisponível no momento. Tente novamente mais tarde.";

        errosDiv.style.display = "block";
    } finally {
        botao.disabled = false;
        botao.value = "Enviar";
    }

    return false;
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
            console.log("Body recebido:", dados);

            if (!response.ok) {
                throw new Error(
                    dados.message ||
                    dados.error ||
                    `Erro ${response.status}: ${texto}`
                );
            }

            return dados;

        } catch (erro) {
            ultimoErro = erro;
        }
    }

    throw ultimoErro;
}
