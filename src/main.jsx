// Importação das bibliotecas React necessárias.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Importa o componente principal da aplicação.

// Renderização do componente App no elemento com id 'root' no HTML.
// ReactDOM.createRoot é o método moderno para inicializar aplicações React 18+.
ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode> é um componente que ativa verificações adicionais e avisos
    // durante o desenvolvimento para identificar problemas potenciais. Não afeta a build de produção.
    <React.StrictMode>
        <App /> {/* Renderiza o componente principal da sua aplicação. */}
    </React.StrictMode>
);