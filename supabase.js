// supabase.js
export const supabaseUrl = 'https://uqwivywhiocehghdnztf.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxd2l2eXdoaW9jZWhnaGRuenRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTk0MDcsImV4cCI6MjA3NzA3NTQwN30.VkczSLl2ptEmIB1HT-Tlh027YfvGMyi3p3z5d-IqML4';
export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export async function salvarAvaliacao(dados) {
  const { error } = await supabase
    .from('avaliacoes')
    .insert([dados]);
  if(error) throw error;
}

export async function exportarAvaliacoesCSV() {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*');
  if(error) throw error;
  let csv = Object.keys(data[0]).join(',') + '\n';
  csv += data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "avaliacoes.csv";
  a.click();
}

