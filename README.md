# Avaliação de Frases Reconstruídas por IA — Pesquisa PLN

Este projeto é uma aplicação web para coleta anônima de avaliações sobre frases reconstruídas por Inteligência Artificial. O objetivo é medir clareza, fidelidade e remoção de ambiguidade/sarcasmo usando dados crowdsourcing.

## Tecnologias

- HTML, CSS e JavaScript puro (sem frameworks)
- Supabase (Postgres + autenticação anônima)
- Site estático, pronto para GitHub Pages

## Como usar

1. **Configure o Supabase**
   - Crie um projeto e uma tabela `avaliacoes` com os campos citados.
   - Habilite Row Level Security (RLS) e adicione policy de `INSERT` com `true`.
   - Pegue a URL e chave anônima e coloque em `supabase.js`.

2. **Clone o projeto**
git clone https://github.com/SEU_USUARIO/pln-avaliacao.git

3. **Suba para o GitHub Pages**
- No repositório, acesse Settings → Pages → branch `main` → root.

4. **Acesse**
- Basta entrar na URL do Pages.

5. **Exportação de dados**
- Para exportar as avaliações para CSV, use a função `exportarAvaliacoesCSV()` no console do navegador.

## Estrutura do Projeto

- `index.html`: página principal e fluxo da pesquisa
- `styles.css`: estilo minimalista e responsivo
- `script.js`: lógica do fluxo e integração com Supabase
- `supabase.js`: inicialização e funções de banco
- `frases.csv`: frases usadas na avaliação

## Licença

MIT
