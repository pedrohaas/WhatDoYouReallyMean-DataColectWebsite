function uuidv4() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback manual se o navegador não tiver suporte:
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


let frases = [];
let indice = 0;
let userId = uuidv4();
let idade, escolaridade;

// Função baseada em Regex para parsing CSV seguro (suporta aspas e vírgulas dentro das células)
function parseCSV(text) {
  const linhas = [];
  const regex = /("([^"]|"")*"|[^,\r\n]*)(,|\r?\n|$)/g;
  let row = [], match;
  let i = 0;

  text = text.replace(/\r/g, ""); // Sanitize newlines

  while ((match = regex.exec(text))) {
    let val = match[1];
    if (val === undefined) break;
    // Remove aspas duplas e faz unescape
    if (val.startsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
    row.push(val);
    if (match[3] === "\n" || match[3] === "" || match[3] === "\r\n") {
      // pular header se i == 0
      if (i > 0 && row.length >= 3) {
        linhas.push({ id: row[0], original: row[1], reconstruida: row[2] });
      }
      row = [];
      i++;
    }
  }
  return linhas;
}

// Ao carregar frases
async function carregarFrases() {
  const response = await fetch("frases.csv");
  const texto = await response.text();
  frases = parseCSV(texto); // frases vira array de objetos {id, original, reconstruida}
  frases = frases.sort(() => Math.random() - 0.5);
}


function criarLikert(container) {
  container.innerHTML = '';
  const criterio = container.dataset.criterio;

  for (let i = 1; i <= 7; i++) {
    const label = document.createElement("label");
    label.className = "likert-label";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = criterio;
    input.value = i;
    input.required = true;
    input.id = `${criterio}-${i}`;

    label.appendChild(input);

    let caption = i.toString();
    if (i === 1) caption += ' <span>Discordo totalmente</span>';
    if (i === 7) caption += ' <span>Concordo totalmente</span>';

    let span = document.createElement("span");
    span.innerHTML = caption;
    label.appendChild(span);

    container.appendChild(label);
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
