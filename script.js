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

function parseCSV(text) {
  const linhas = [];
  const re = /(,|\r?\n|^)("(?:[^"]|"")*"|[^",\r\n]*)/g;
  let currRow = [];
  let match;
  let i = 0;

  // Remove BOM e normaliza quebras de linha
  text = text.replace(/^\uFEFF/, '');

  let rowIndex = 0;
  let lastIndex = 0;
  let inQuotes = false;
  let field = '';
  let rows = [];

  for (let c = 0; c < text.length; c++) {
    let char = text[c];
    if (char === '"') {
      if (inQuotes && text[c + 1] === '"') {
        field += '"';
        c++; // escapa aspas duplas
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currRow.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[c + 1] === '\n') c++; // windows-style
      currRow.push(field);
      if (rowIndex > 0) {
        // Pula header 
        let [id, original, reconstruida] = currRow;
        if (currRow.length >= 3)
          linhas.push({ id, original, reconstruida });
      }
      currRow = [];
      field = '';
      rowIndex++;
    } else {
      field += char;
    }
  }
  // Última linha
  if (field.length > 0 || currRow.length > 0) {
    currRow.push(field);
    if (rowIndex > 0) {
      let [id, original, reconstruida] = currRow;
      if (currRow.length >= 3)
        linhas.push({ id, original, reconstruida });
    }
  }
  return linhas;
}


async function carregarFrases() {
  const response = await fetch("frases.csv");
  const texto = await response.text();
  frases = parseCSV(texto); // Agora robusto!
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

  document.querySelectorAll(".likert-row").forEach(c => criarLikert(c));

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
