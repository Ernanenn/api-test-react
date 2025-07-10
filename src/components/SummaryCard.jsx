import React from 'react';

// Componente que exibe um card de resumo.
// Usado para mostrar estatísticas como total de testes, testes que passaram e falharam.
const SummaryCard = ({ title, value, colorClass }) => (
    // Aplica classes CSS dinamicamente para estilização do card e cores.
    <div className={`summary-card ${colorClass}`}>
        {/* Número da estatística (ex: total de testes, testes que passaram). */}
        <div className="summary-number">{value}</div>
        {/* Título da estatística (ex: "Total", "Passou"). */}
        <div>{title}</div>
    </div>
);

export default SummaryCard;
