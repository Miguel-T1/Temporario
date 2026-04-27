const API_URL = "https://backend-node-nmze.onrender.com/featured";
const CACHE_KEY = "featuredProducts";
const CACHE_TIME = 2 * 60 * 1000;

let allProducts = [];
let persistentFeaturedMessage = { text: "", type: "info" };

const mockProducts = [
  { id: 101, title: "Notebook Gamer", price: 4500, highlight: true },
  { id: 102, title: "Mouse RGB", price: "200", highlight: "true" },
  { id: 103, title: null, price: 150, highlight: true },
  { id: 104, price: 900, highlight: false },
  { id: 105, title: "Monitor 4K", price: 3000, highlight: true },
  { id: 106, title: "Teclado Mecânico", price: undefined, highlight: true }
];

function getFeaturedContainer() {
  return document.getElementById("featuredProducts");
}

function getFeaturedMessageBox() {
  return document.getElementById("featuredMessage");
}

function setFeaturedMessage(text, type = "info") {
  const messageBox = getFeaturedMessageBox();
  if (!messageBox) return;

  messageBox.textContent = text;
  messageBox.className = `mensagem ${type}`;
  messageBox.style.display = text ? "block" : "none";
}

function clearFeaturedMessage() {
  setFeaturedMessage("", "info");
}

function setPersistentFeaturedMessage(text, type = "info") {
  persistentFeaturedMessage = { text, type };
  setFeaturedMessage(text, type);
}

function restorePersistentFeaturedMessage() {
  if (persistentFeaturedMessage.text) {
    setFeaturedMessage(persistentFeaturedMessage.text, persistentFeaturedMessage.type);
  } else {
    clearFeaturedMessage();
  }
}

function normalizeTitle(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
  }

  return NaN;
}

function normalizeProduct(product) {
  return {
    id: product?.id,
    title: normalizeTitle(product?.title),
    price: normalizePrice(product?.price),
    highlight: product?.highlight === true || product?.highlight === "true"
  };
}

function validateProduct(product) {
  return Boolean(product.title) && Number.isFinite(product.price) && product.price > 0;
}

function extractProductsArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  throw new Error("Formato de resposta inválido.");
}

function prepareProducts(data) {
  return extractProductsArray(data)
    .map(normalizeProduct)
    .filter(validateProduct)
    .filter(product => product.highlight);
}

function formatPrice(price) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(price);
}

function renderProducts(products) {
  const container = getFeaturedContainer();
  if (!container) return;

  if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML = '<p class="sem-resultados">Nenhum produto encontrado.</p>';
    return;
  }

  container.innerHTML = products
    .map(product => `
      <article class="card">
        <h3>${product.title}</h3>
        <p>${formatPrice(product.price)}</p>
      </article>
    `)
    .join("");
}

function showLoading() {
  const container = getFeaturedContainer();
  if (!container) return;

  clearFeaturedMessage();
  container.innerHTML = '<p class="loading-text">Carregando produtos...</p>';
}

function saveCache(data) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      time: Date.now()
    })
  );
}

function getCache() {
  const cache = localStorage.getItem(CACHE_KEY);
  if (!cache) return null;

  try {
    const parsed = JSON.parse(cache);
    const isValid = parsed && typeof parsed.time === "number" && Date.now() - parsed.time < CACHE_TIME;

    if (isValid) {
      return parsed.data;
    }

    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = 5, delay = 3000, fetchImpl = fetch) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url);

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      const productsArray = extractProductsArray(data);

      if (productsArray.length === 0) {
        throw new Error("Resposta vazia.");
      }

      return data;
    } catch (error) {
      lastError = error;
      console.log(`Tentativa ${attempt} falhou: ${error.message}`);

      if (attempt < attempts) {
        await wait(delay);
      }
    }
  }

  throw lastError || new Error("Falha ao buscar os produtos.");
}

function getFilterValues() {
  const nomeInput = document.getElementById("filtroNome");
  const precoMinimoInput = document.getElementById("precoMinimo");
  const precoMaximoInput = document.getElementById("precoMaximo");

  const nome = nomeInput ? nomeInput.value.trim().toLowerCase() : "";
  const precoMinimo = precoMinimoInput && precoMinimoInput.value !== "" ? Number(precoMinimoInput.value) : null;
  const precoMaximo = precoMaximoInput && precoMaximoInput.value !== "" ? Number(precoMaximoInput.value) : null;

  return { nome, precoMinimo, precoMaximo };
}

function filterProducts(products, filters) {
  return products.filter(product => {
    const matchNome = !filters.nome || product.title.toLowerCase().includes(filters.nome);
    const matchPrecoMinimo = filters.precoMinimo === null || product.price >= filters.precoMinimo;
    const matchPrecoMaximo = filters.precoMaximo === null || product.price <= filters.precoMaximo;

    return matchNome && matchPrecoMinimo && matchPrecoMaximo;
  });
}

function applyFilters() {
  if (!Array.isArray(allProducts)) return;

  const filters = getFilterValues();

  if (
    filters.precoMinimo !== null &&
    filters.precoMaximo !== null &&
    filters.precoMinimo > filters.precoMaximo
  ) {
    renderProducts([]);
    setFeaturedMessage("O preço mínimo não pode ser maior que o preço máximo.", "erro");
    return;
  }

  const filteredProducts = filterProducts(allProducts, filters);
  renderProducts(filteredProducts);

  if (filteredProducts.length === 0) {
    setFeaturedMessage("Nenhum produto encontrado para os filtros informados.", "aviso");
  } else {
    restorePersistentFeaturedMessage();
  }
}

function resetFilters() {
  const nomeInput = document.getElementById("filtroNome");
  const precoMinimoInput = document.getElementById("precoMinimo");
  const precoMaximoInput = document.getElementById("precoMaximo");

  if (nomeInput) nomeInput.value = "";
  if (precoMinimoInput) precoMinimoInput.value = "";
  if (precoMaximoInput) precoMaximoInput.value = "";

  renderProducts(allProducts);
  restorePersistentFeaturedMessage();
}

async function loadProducts() {
  const container = getFeaturedContainer();
  if (!container) return;

  showLoading();

  try {
    const cachedData = getCache();

    if (cachedData) {
      allProducts = prepareProducts(cachedData);
      renderProducts(allProducts);
      setPersistentFeaturedMessage(
        "Produtos carregados do armazenamento local. Nenhuma nova requisição foi necessária.",
        "sucesso"
      );
      return;
    }

    const data = await fetchWithRetry(API_URL);
    saveCache(data);

    allProducts = prepareProducts(data);
    renderProducts(allProducts);
    setPersistentFeaturedMessage("Produtos carregados da API com sucesso.", "sucesso");
  } catch (error) {
    console.error("Falha ao consultar a API. Usando MOCK local.", error);

    allProducts = prepareProducts(mockProducts);
    renderProducts(allProducts);
    setPersistentFeaturedMessage(
      "API instável no momento. Exibindo dados locais para você continuar usando a página.",
      "aviso"
    );
  }
}

function setCadastroMessage(text, type) {
  const errorBox = document.getElementById("mensagemErro");
  const successBox = document.getElementById("mensagemSucesso");

  if (errorBox) {
    errorBox.style.display = "none";
    errorBox.textContent = "";
  }

  if (successBox) {
    successBox.style.display = "none";
    successBox.textContent = "";
  }

  if (type === "erro" && errorBox) {
    errorBox.textContent = text;
    errorBox.style.display = "block";
  }

  if (type === "sucesso" && successBox) {
    successBox.textContent = text;
    successBox.style.display = "block";
  }
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function enviarForm(event) {
  if (event) event.preventDefault();

  const form = document.getElementById("formCadastro");
  if (!form) return false;

  const nome = document.getElementById("nome")?.value.trim() || "";
  const telefone = document.getElementById("telefone")?.value.trim() || "";
  const cep = document.getElementById("CEP")?.value.trim() || "";
  const email = document.getElementById("mail")?.value.trim() || "";
  const senha = document.getElementById("senha")?.value || "";
  const confirmarSenha = document.getElementById("confirmarSenha")?.value || "";

  if (nome.split(/\s+/).filter(Boolean).length < 2) {
    setCadastroMessage("Informe nome e sobrenome.", "erro");
    return false;
  }

  const telefoneDigits = onlyDigits(telefone);
  if (telefoneDigits.length < 10 || telefoneDigits.length > 11) {
    setCadastroMessage("Informe um telefone válido com DDD.", "erro");
    return false;
  }

  if (onlyDigits(cep).length !== 8) {
    setCadastroMessage("Informe um CEP válido com 8 dígitos.", "erro");
    return false;
  }

  if (!email.includes("@") || !email.includes(".")) {
    setCadastroMessage("Informe um e-mail válido.", "erro");
    return false;
  }

  if (senha.length < 6) {
    setCadastroMessage("A senha deve ter pelo menos 6 caracteres.", "erro");
    return false;
  }

  if (senha !== confirmarSenha) {
    setCadastroMessage("As senhas não coincidem.", "erro");
    return false;
  }

  setCadastroMessage("Cadastro realizado com sucesso!", "sucesso");
  return false;
}

if (typeof window !== "undefined") {
  window.applyFilters = applyFilters;
  window.resetFilters = resetFilters;
  window.enviarForm = enviarForm;
  window.loadProducts = loadProducts;
  window.fetchWithRetry = fetchWithRetry;
  window.prepareProducts = prepareProducts;
}

loadProducts();
