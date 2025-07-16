🧪 API Test Suite

Uma ferramenta intuitiva e poderosa para realizar testes automatizados em APIs RESTful, desenvolvida com React e Vite. Esta aplicação permite configurar requisições HTTP, executar testes, validar respostas e visualizar resultados de forma clara e organizada, além de possibilitar a exportação dos relatórios.

🌟 Funcionalidades

Configuração de Testes: Defina URL, método HTTP (GET, POST, PUT, DELETE, PATCH), headers (JSON), corpo da requisição (JSON), status HTTP esperado e tempo máximo de resposta.
Execução de Testes: Inicie os testes com um clique e observe o feedback visual de carregamento.
Visualização Detalhada de Resultados: Cada teste é exibido em um card individual com status (passou/falhou), timestamp, duração, mensagem e detalhes da resposta da API.
Validações Automáticas: Inclui validações para Content-Type (JSON), tempo de resposta e estrutura do corpo JSON da resposta.
Sumário de Testes: Um painel de resumo mostra o total de testes executados, quantos passaram e quantos falharam.
Exportação de Relatórios: Exporte os resultados completos dos testes para arquivos JSON ou PDF.
Interface Responsiva: Design adaptável para diferentes tamanhos de tela (desktop, tablet, mobile).

🛠️ Tecnologias Utilizadas

Frontend:
React (v18.x) - Biblioteca JavaScript para construção de interfaces de usuário.
Vite (v5.x) - Ferramenta de build de frontend de próxima geração.
Estilização: CSS puro com variáveis CSS para um design consistente e responsivo.

Utilitários:
html2canvas - Para capturar o conteúdo HTML e transformá-lo em imagens para exportação PDF.
jsPDF - Para gerar documentos PDF no lado do cliente.

Ferramentas de Desenvolvimento:
ESLint - Para análise estática de código e garantia de qualidade.
@vitejs/plugin-react - Plugin Vite para suporte a React.
@types/react, @types/react-dom - Tipagem para React (se TypeScript for usado ou para melhor DX).
autoprefixer, postcss - Para processamento CSS.

🚀 Como Rodar o Projeto

Pré-requisitos
Certifique-se de ter o Node.js (versão 18 ou superior) e o npm (ou Yarn/pnpm) instalados em sua máquina.

Instalação
Clone o repositório:
git clone [URL_DO_SEU_REPOSITORIO]
cd meu-app

Instale as dependências:
npm install
yarn install
pnpm install

Scripts Disponíveis
No diretório do projeto, você pode rodar:

npm run dev
Inicia o servidor de desenvolvimento do Vite. A aplicação estará disponível em http://localhost:5173 (ou outra porta disponível). O Fast Refresh estará ativo para uma experiência de desenvolvimento ágil.

npm run build
Cria uma build otimizada da aplicação para produção no diretório dist/.

npm run lint
Executa o ESLint para analisar o código e identificar problemas de estilo e erros.

npm run preview
Serve a build de produção localmente, útil para testar antes de fazer o deploy.

💡 Como Usar

Configurar o Teste: No painel esquerdo, preencha os campos com os detalhes da requisição API (URL, Método, Headers, Body, Status Esperado, Tempo Máximo de Resposta e Nome do Teste).
Executar o Teste: Clique no botão "Executar Teste". Os resultados aparecerão no painel direito.
Visualizar Resultados: Explore os cards individuais para ver os detalhes de cada teste, incluindo a resposta da API e as validações.
Limpar Resultados: Use o botão "Limpar" para remover todos os resultados da tela.
Exportar Relatórios: Clique nos botões "JSON" ou "PDF" para baixar um relatório dos testes executados.

🔮 Melhorias Futuras

Com base na análise da aplicação, as seguintes melhorias podem ser consideradas:
Sistema de Feedback de UI: Substituir o uso de alert() por um sistema de notificação mais amigável (como toasts ou modais personalizados) para mensagens de erro e sucesso, melhorando a experiência do usuário.
Validação de Input Robusta: Aprimorar a validação dos campos de entrada do formulário (headers, body, expectedStatus) para fornecer feedback imediato e claro ao usuário sobre formatos inválidos, antes mesmo da tentativa de execução do teste.
Validações Personalizadas: Adicionar a capacidade de o usuário definir validações personalizadas para o corpo da resposta da API (ex: verificar a existência de uma propriedade específica ou seu valor).
Gerenciamento de Testes: Implementar funcionalidades para salvar, carregar e gerenciar múltiplos conjuntos de configurações de teste.
Testes Automatizados: Adicionar testes unitários para os hooks e componentes, e testes de integração para o fluxo completo da aplicação.
Acessibilidade (A11y): Integrar um plugin ESLint de acessibilidade (eslint-plugin-jsx-a11y) e revisar a UI para garantir que a aplicação seja utilizável por pessoas com deficiência.
Tipagem Forte: Considerar a migração para TypeScript para maior segurança de tipo e melhor documentação do código em todo o projeto.
Otimizações de Performance: Explorar otimizações adicionais na build do Vite e no carregamento de recursos.
Internacionalização (i18n): Adicionar suporte a múltiplos idiomas para a interface.

Desenvolvido por: Ernane Nogueira Nunes.
