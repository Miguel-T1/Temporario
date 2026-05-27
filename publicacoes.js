const API_PUBLICACOES = "https://backend-posts-obfy.onrender.com";

const container = document.getElementById("publicacoesContainer");
const mensagem = document.getElementById("mensagemPublicacoes");

async function carregarPublicacoes() {
  try {
    const resposta = await fetch(API_PUBLICACOES);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar publicações");
    }

    const publicacoes = await resposta.json();

    mensagem.style.display = "none";

    container.innerHTML = publicacoes.map(post => `
      <div class="card publicacao-card">
        <img src="${post.fotoAutor}" alt="Foto de ${post.autor}" class="foto-autor">
        <h3>${post.titulo}</h3>
        <p>${post.descricao}</p>
        <p><strong>Autor:</strong> ${post.autor}</p>
        <p><strong>Data:</strong> ${post.dataPublicacao}</p>
      </div>
    `).join("");

  } catch (erro) {
    mensagem.textContent = "Erro ao carregar publicações. Verifique se a API está funcionando.";
    mensagem.className = "mensagem erro";
    console.error(erro);
  }
}

carregarPublicacoes();
