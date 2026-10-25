# Turismo a Frente — primeira versão

Site responsivo em HTML/CSS/JavaScript, pronto para GitHub Pages.

## Conteúdo
- Landing page com quatro áreas de vídeo.
- Formulário de pesquisa que organiza a viagem e prepara uma mensagem de cotação.
- Páginas individuais: Caribe, Orlando, Nordeste, Europa e América do Sul.
- Botões de WhatsApp configuráveis.
- Capas SVG provisórias para substituir por fotografias reais.

## Vídeos
Copie os vídeos compactados para `videos/` e renomeie:
- `video1.mp4`: pontos turísticos internacionais
- `video2.mp4`: pontos turísticos brasileiros
- `video3.mp4`: destinos paradisíacos
- `video4.mp4`: navio, trem e avião

## WhatsApp
Edite `js/config.js` e informe o telefone no formato internacional, apenas números. Exemplo fictício: `5511999999999`.

## Publicação no GitHub Pages
1. Extraia o ZIP.
2. Envie todo o conteúdo desta pasta para a raiz do repositório `Turismoafrente` (o `index.html` precisa ficar na raiz).
3. No GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.

## Importante
O buscador ainda não consulta voos, preços ou disponibilidade reais. Ele apenas organiza os dados e prepara uma mensagem de cotação para WhatsApp. Não há banco de dados nem captura persistente de leads nesta versão. A integração com API de voos pode ser adicionada depois por um backend seguro.
As capas em SVG são marcadores provisórios; substitua-as por suas fotos para ter imagens reais.
