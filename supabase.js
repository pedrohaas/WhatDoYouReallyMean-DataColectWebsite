// supabase.js
const supabaseUrl = 'SUAURL';
const supabaseKey = 'SUAANONKEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function salvarAvaliacao(dados) {
  const { error } = await supabase
    .from('avaliacoes')
    .insert([dados]);
  if (error) throw error;
}
window.salvarAvaliacao = salvarAvaliacao;

async function exportarAvaliacoesCSV() {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*');
  if (error) throw error;
  let csv = Object.keys(data[0]).join(',') + '\n';
  csv += data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "avaliacoes.csv";
  a.click();
}
window.exportarAvaliacoesCSV = exportarAvaliacoesCSV;
