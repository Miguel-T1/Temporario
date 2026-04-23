function enviarFormulario() {

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

    if (nome.split(" ").length < 2) {
        erros.push("Digite nome e sobrenome");
    }

    if (!regexTel.test(telefone)) {
        erros.push("Telefone inválido (use 00 00000-0000)");
    }

    if (!regexCEP.test(cep)) {
        erros.push("CEP inválido (use 00000-000)");
    }

    if (!regexEmail.test(email)) {
        erros.push("E-mail inválido");
    }

    if (senha.length < 6) {
        erros.push("Senha deve ter no mínimo 6 caracteres");
    }

    if (senha !== confirmarSenha) {
        erros.push("Senhas não coincidem");
    }

   
    if (erros.length > 0) {
        document.getElementById("erros").innerHTML = erros.join("<br>");
        document.getElementById("erros").style.display = "block";
        document.getElementById("resultado").style.display = "none";
        return false;
    }

    document.getElementById("erros").style.display = "none";


    fetch("https://backend-node-nmze.onrender.com/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: nome,
            email: email,
            phone: telefone
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(data => {

        let gift = data.gift || "desconhecido";

        document.getElementById("resultado").innerHTML =
            `Parabéns ${nome}, você realizou seu cadastro com o e-mail ${email}.<br>
            Entraremos em contato através do seu telefone ${telefone}.<br>
            Você ganhou um prêmio: ${gift}`;

        document.getElementById("resultado").style.display = "block";
        document.getElementById("erros").style.display = "none";
    })
    .catch(() => {
        document.getElementById("resultado").innerHTML =
            "Servidor indisponível. Tente novamente mais tarde.";

        document.getElementById("resultado").style.display = "block";
        document.getElementById("erros").style.display = "none";
    });

    return false;
}