# Kit de Voz 2026 - Congresso Umademis

Pagina web estatica para organizar e acessar links de estudo por naipe (Soprano, Contralto e Tenor) do Congresso Umademis 2026.

## 🌐 Pagina publicada

👉 **https://matheuslimagomes.github.io/umademis-2026/**

## Objetivo

Centralizar os links de audios/videos do repertorio em uma interface simples, responsiva e facil de usar em celular e desktop.

## Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)
- GitHub Actions (automacao CI/CD)
- GitHub Pages (hospedagem)

## Estrutura do projeto

```text
.
├── .github/
│   └── workflows/
│       └── static.yml
├── assets/
├── design-tokens.json
├── index.html
├── script.js
├── styles.css
└── tokens.css
```

## Como executar localmente

Como o projeto e estatico, voce pode abrir o arquivo `index.html` direto no navegador.

Para melhor compatibilidade com embeds (especialmente YouTube), recomenda-se rodar com servidor local:

```bash
cd congresso2026
python3 -m http.server 5500
```

Depois, abra:

```text
http://localhost:5500
```

## Funcionalidades principais

- Lista de musicas por naipe.
- Identificacao visual do tipo de link (YouTube, Drive, Pasta, Link).
- Preview embutido quando o link permite embed.
- Abertura de link original em nova aba.
- Interface responsiva com design tokens reutilizaveis.

## Design tokens

O projeto possui duas fontes de tokens:

- `design-tokens.json`: fonte estruturada de tokens (cores, tipografia, espacamento etc.).
- `tokens.css`: exposicao dos tokens em variaveis CSS (`:root`) usadas no layout.

## Fluxo de trabalho (branches)

Padrao trunk-based simplificado:

1. Desenvolver em branch `feature/*`.
2. Abrir PR para `main`.
3. Apos merge em `main`, o deploy de producao e disparado automaticamente.

## Etapa de CI/CD

Esta etapa ja esta configurada em `.github/workflows` e usa GitHub Actions + GitHub Pages.

### Deploy automatico para GitHub Pages

Arquivo: `.github/workflows/static.yml`

- Gatilho: `push` em `main` ou execucao manual via Actions
- Acao: faz upload do conteudo estatico e publica no GitHub Pages
- URL publicada: https://matheuslimagomes.github.io/umademis-2026/
- Objetivo: publicar automaticamente a versao oficial a cada push na branch principal

## Secrets necessarios

Para o workflow de deploy funcionar, nenhum secret adicional e necessario alem do:

- `GITHUB_TOKEN` (fornecido automaticamente pelo GitHub Actions)

## Boas praticas de manutencao

- Validar se links de Drive/YouTube continuam ativos.
- Manter nomes de branch no padrao `feature/*` para acionar automacoes.
- Atualizar `design-tokens.json` e `tokens.css` em conjunto para evitar inconsistencias visuais.
