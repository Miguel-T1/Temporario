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

    const phone = telefone.replace(/\D/g, "");

    const regexCEP = /^\d{5}-\d{3}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nome.split(/\s+/).length < 2) {
        erros.push("Digite nome e sobrenome.");
    }

    if (phone.length !== 10 && phone.length !== 11) {
        erros.push("Telefone inválido.");
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
        phone: phone,
        password: senha
    };

    try {
        botao.disabled = true;
        botao.value = "Enviando...";

        const response = await fetch("https://backend-node-nmze.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const texto = await response.text();
        console.log("Status:", response.status);
        console.log("Resposta bruta:", texto);
        console.log("Dados enviados:", dados);

        let resultado;
        try {
            resultado = JSON.parse(texto);
        } catch {
            resultado = { raw: texto };
        }

        console.log("Resposta convertida:", resultado);

        if (!response.ok) {
            throw new Error(
                resultado.message ||
                resultado.error ||
                resultado.raw ||
                `Erro ${response.status}`
            );
        }

        const gift =
            resultado.gift ||
            resultado.data?.gift ||
            resultado.prize ||
            resultado.data?.prize ||
            resultado.brinde ||
            resultado.data?.brinde ||
            "prêmio não informado";

        sucessoDiv.innerHTML = `Parabéns ${nome}, você realizou seu cadastro com o email ${email}. Entraremos em contato através do seu telefone ${formatarTelefone(phone)}. Você ganhou este prêmio ${gift}.`;
        sucessoDiv.style.display = "block";

        form.reset();

    } catch (erro) {
        console.error("Erro completo:", erro);
        erroDiv.innerHTML = erro.message || "Não foi possível concluir o cadastro.";
        erroDiv.style.display = "block";
    } finally {
        botao.disabled = false;
        botao.value = "Cadastrar";
    }
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
