// Importa configurações padrão do ESLint.
import js from '@eslint/js';
// Importa definições de variáveis globais para diferentes ambientes.
import globals from 'globals';
// Importa plugins e configurações para React Hooks.
import reactHooks from 'eslint-plugin-react-hooks';
// Importa plugin para Fast Refresh do React no Vite.
import reactRefresh from 'eslint-plugin-react-refresh';
// Importa plugin para regras de acessibilidade em JSX.
import jsxA11y from 'eslint-plugin-jsx-a11y';
// Importa utilitários de configuração do ESLint e para ignorar arquivos globalmente.
import { defineConfig, globalIgnores } from 'eslint/config';

// Exporta a configuração plana do ESLint.
export default defineConfig([
  // Ignora o diretório 'dist' globalmente para análise do ESLint.
  globalIgnores(['dist']),
  {
    // Aplica esta configuração a todos os arquivos .js e .jsx.
    files: ['**/*.{js,jsx}'],
    // Estende configurações recomendadas de outros plugins.
    extends: [
      js.configs.recommended, // Regras JavaScript recomendadas.
      reactHooks.configs['recommended-latest'], // Regras mais recentes para React Hooks.
      reactRefresh.configs.vite, // Configurações para Fast Refresh do Vite.
      jsxA11y.configs.recommended, // Regras de acessibilidade recomendadas para JSX.
    ],
    // Configurações de linguagem e parser.
    languageOptions: {
      ecmaVersion: 2020, // Versão ECMAScript a ser suportada.
      globals: globals.browser, // Define variáveis globais do ambiente de navegador.
      parserOptions: {
        ecmaVersion: 'latest', // Permite o uso das últimas funcionalidades da linguagem.
        ecmaFeatures: { jsx: true }, // Habilita o suporte a JSX.
        sourceType: 'module', // Define o tipo de código como módulos ES.
      },
    },
    // Regras personalizadas.
    rules: {
      // Configura a regra 'no-unused-vars' para erro, mas ignora variáveis
      // que começam com letras maiúsculas ou underscore (comum para componentes React ou constantes).
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);