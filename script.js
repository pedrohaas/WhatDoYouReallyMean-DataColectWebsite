import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.0/dist/esm-browser/index.js";

let frases = [];
let indice = 0;
let userId = uuidv4();
let idade, escolaridade;

async function carregarFrases() {
  const response = await fetch("frases.csv");
  const texto = await response.text();
  const linhas = texto.trim().split("\n").slice(1);
  frases = linhas.map(l => {
    const partes = l.split(",");
    return { id: partes[0], original: partes[1], reconstruida: partes[2] };
  });
  frases = frases.sort(() => Math.random() - 0.5);
}

function criarLikert(container) {
  for (let i = 1; i <= 7; i++) {
    const label = document.createElement("label");
    label.textContent = i;
    const input = document.createElement("input");
    input.type = "radio";
    input.name = container.dataset.criterio;
    input.value = i;
    container.append(input, label);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarFrases();

  document.querySelectorAll(".likert").forEach(c => criarLikert(c));

  document.getElementById("iniciar-consentimento").onclick = () => {
    document.getElementById("consentimento").classList.add("oculto");
    document.getElementById("demografia").classList.remove("oculto");
  };

  document.getElementById("iniciar-avaliacao").onclick = () => {
    idade = document.getElementById("idade").value;
    escolaridade = document.getElementById("escolaridade").value;
    if (!idade || !escolaridade) return alert("Por favor, preencha todos os campos.");
    document.getElementById("demografia").classList.add("oculto");
    document.getElementById("avaliacao").classList.remove("oculto");
    mostrarFrase();
  };

  document.getElementById("proxima-frase").onclick = async () => {
    const clareza = document.querySelector("input[name='clareza']:checked")?.value;
    const fidelidade = document.querySelector("input[name='fidelidade']:checked")?.value;
    const efetividade = document.querySelector("input[name='efetividade']:checked")?.value;
    if (!clareza || !fidelidade || !efetividade) return alert("Por favor, avalie todos os critérios.");
    const dados = {
      user_id: userId,
      idade: Number(idade),
      escolaridade,
      id_frase: frases[indice].id,
      clareza: Number(clareza),
      fidelidade: Number(fidelidade),
      efetividade: Number(efetividade),
      timestamp: new Date().toISOString()
    };
    await salvarAvaliacao(dados);
    indice++;
    if (indice < frases.length) mostrarFrase();
    else encerrar();
  };
});

function mostrarFrase() {
  document.getElementById("container-frases").innerHTML = `
    <p><strong>Frase original:</strong> ${frases[indice].original}</p>
    <p><strong>Frase reestruturada por IA:</strong> ${frases[indice].reconstruida}</p>
  `;
  document.querySelectorAll(".likert input").forEach(inp => inp.checked = false);
}

function encerrar() {
  document.getElementById("avaliacao").classList.add("oculto");
  document.getElementById("final").classList.remove("oculto");
}
