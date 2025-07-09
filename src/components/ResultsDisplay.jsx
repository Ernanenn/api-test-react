import SummaryCard from './SummaryCard.jsx';
import ResultCard from './ResultCard.jsx';

// Componente que exibe todos os resultados dos testes
// Inclui cards de resumo e lista de resultados individuais
const ResultsDisplay = ({ results, summary, isLoading, containerRef }) => (
    <div className="test-results" ref={containerRef}>
        <h2 className="section-title">Resultados dos Testes</h2>
        {/* Cards de resumo (total, passou, falhou) */}
        <div className="test-summary">
            <SummaryCard title="Total" value={summary.total} colorClass="total" />
            <SummaryCard title="Passou" value={summary.passed} colorClass="passed" />
            <SummaryCard title="Falhou" value={summary.failed} colorClass="failed" />
        </div>
        {/* Container de resultados */}
        <div className="results-container">
            {results.length === 0 ? (
                isLoading 
                    ? <p className="text-muted">Executando...</p>
                    : <p className="text-muted">Nenhum teste executado ainda.</p>
            ) : (
                results.map(result => <ResultCard key={result.id} result={result} />)
            )}
        </div>
    </div>
);

export default ResultsDisplay;