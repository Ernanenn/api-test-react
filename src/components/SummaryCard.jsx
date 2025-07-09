import React from 'react';

// Componente que exibe um card de resumo
// Usado para mostrar estatísticas como total de testes, testes que passaram e falharam
const SummaryCard = ({ title, value, colorClass }) => (
    <div className={`summary-card ${colorClass}`}>
        <div className="summary-number">{value}</div>
        <div>{title}</div>
    </div>
);

export default SummaryCard;