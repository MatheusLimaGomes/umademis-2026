# Kit de Voz 2026 - Congresso Umademis

Pagina web estatica para organizar e acessar links de estudo por naipe (Soprano, Contralto e Tenor) do Congresso Umademis 2026.

## Objetivo

Centralizar os links de audios/videos do repertorio em uma interface simples, responsiva e facil de usar em celular e desktop.

## Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)
- GitHub Actions (automacao CI/CD)
- Netlify (preview e producao)

## Estrutura do projeto

```text
.
├── .github/
│   └── workflows/
│       ├── 01-open-pr-from-feature.yml
│       ├── 02-deploy-preview-pr.yml
│       ├── 03-auto-merge-approved-pr.yml
│       └── 04-deploy-production-main.yml
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
2. Ao fazer push na branch de feature, um PR para `main` e aberto automaticamente.
3. Ao abrir/atualizar PR, o ambiente de preview e publicado.
4. Apos aprovacao do PR, o merge e executado automaticamente (squash).
5. Push em `main` dispara deploy de producao.

## Etapa de CI/CD

Esta etapa ja esta configurada em `.github/workflows` e usa GitHub Actions + Netlify CLI.

### 1) Abertura automatica de PR

Arquivo: `.github/workflows/01-open-pr-from-feature.yml`

- Gatilho: `push` em `feature/**`
- Acao: abre (ou atualiza) PR para `main`
- Objetivo: padronizar entrada de mudancas na branch principal

### 2) Deploy de preview por PR

Arquivo: `.github/workflows/02-deploy-preview-pr.yml`

- Gatilho: eventos de `pull_request` para `main`
- Condicao: apenas PRs com branch de origem `feature/*`
- Acao: faz deploy no Netlify com alias `pr-<numero-do-pr>`
- Objetivo: validar visual e comportamento antes do merge

### 3) Auto-merge apos aprovacao

Arquivo: `.github/workflows/03-auto-merge-approved-pr.yml`

- Gatilho: `pull_request_review` submetido
- Condicao: review `approved`, base `main`, origem `feature/*`
- Acao: merge automatico via API do GitHub (`squash`)
- Objetivo: acelerar integracao de mudancas aprovadas

### 4) Deploy de producao na main

Arquivo: `.github/workflows/04-deploy-production-main.yml`

- Gatilho: `push` em `main`
- Acao: deploy de producao no Netlify (`--prod`)
- Objetivo: publicar automaticamente a versao oficial

## Secrets necessarios

Para os workflows de deploy funcionarem, configure no repositorio:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

Tambem e usado:

- `GITHUB_TOKEN` (fornecido automaticamente pelo GitHub Actions)

## Boas praticas de manutencao

- Validar se links de Drive/YouTube continuam ativos.
- Manter nomes de branch no padrao `feature/*` para acionar automacoes.
- Atualizar `design-tokens.json` e `tokens.css` em conjunto para evitar inconsistencias visuais.
[![Netlify Status](https://api.netlify.com/api/v1/badges/e483d506-fd48-4f75-9b38-e1c9cd7a6811/deploy-status)](https://app.netlify.com/projects/congresso-umademis-2026/deploys)