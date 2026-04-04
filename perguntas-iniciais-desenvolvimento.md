## Perguntas para iniciar o desenvolvimento

### 1) Escopo e conteúdo
1. Haverá outros naipes (ex.: baixo/barítono) além de Soprano, Contralto e Tenor?
2. Os links atuais já são finais ou podem mudar depois?
3. Deseja incluir letra, cifra ou apenas os links de áudio?
4. O título correto deve ser "Kit de Voz 2026" ou "Kit de Vozes 2026"?

### 2) Experiência do usuário
5. Cada música deve abrir em nova aba (comportamento padrão para todos os links)?
6. Deseja diferenciar visualmente links do YouTube e Google Drive?
7. Quer campo de busca/filtro por música ou naipe?
8. A ordem dos naipes e músicas deve seguir exatamente a do documento?

### 3) Identidade visual
9. Existe identidade visual oficial do Congresso 2026 (logo, cores, tipografia)?
10. Pode usar os tokens de [design-tokens.json](design-tokens.json) e [tokens.css](tokens.css) como fonte principal de estilo?
11. Deseja modo escuro ou apenas tema claro?

### 4) Técnica e estrutura
12. Qual stack prefere: HTML/CSS/JS puro, React, Next.js ou outra?
13. A página será estática ou precisará de painel para atualizar links futuramente?
14. É necessário suporte offline/PWA?

### 5) Deploy e operação
15. Qual plataforma gratuita prefere para deploy: GitHub Pages, Netlify, Vercel ou outra?
16. O deploy deve ser automático via GitHub a cada atualização?
17. Existe domínio próprio ou ficará em subdomínio da plataforma gratuita?

### 6) Qualidade e governança
18. Precisa de acessibilidade mínima (contraste, navegação por teclado, labels)?
19. Quer métricas/analytics (ex.: Google Analytics) nessa página?
20. Há prazo de entrega e marcos intermediários definidos?

### 7) Segurança e manutenção
21. Pode haver links privados do Drive exigindo login, ou tudo deve ser público?
22. Quem será responsável por validar links quebrados ao longo do tempo?
23. Deseja uma seção de "última atualização" para facilitar manutenção?

## Critério de prontidão para começar
Podemos iniciar a implementação assim que houver definição de:
- Stack do projeto.
- Direção visual base (tokens/branding).
- Plataforma de deploy.
- Regras de atualização/manutenção de links.
