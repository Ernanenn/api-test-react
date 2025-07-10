import React from 'react'; // Importar React para JSX
import SummaryCard from './SummaryCard.jsx';
import ResultCard from './ResultCard.jsx'; // Re-importar ResultCard para testes funcionais
import { CheckCircleIcon, XCircleIcon } from './Icons.jsx'; // Importar ícones diretamente para uso no card de performance

// Componente que exibe todos os resultados dos testes.
// Inclui cards de resumo e uma lista de resultados individuais,
// adaptando a exibição para testes funcionais e de performance.
const ResultsDisplay = ({ results, summary, isLoading, containerRef, isExportMode = false, exportFilterType = 'all' }) => {
    // Filtra os resultados a serem exibidos com base no modo de exportação e no tipo de filtro.
    const displayedResults = isExportMode
        ? results.filter(result => exportFilterType === 'all' || result.type === exportFilterType)
        : results;

    // Recalcula o sumário para os resultados que estão sendo exibidos.
    // Isso é importante para que o sumário no relatório de exportação reflita apenas os testes filtrados.
    const displayedSummary = displayedResults.reduce((acc, r) => {
        acc.total += 1;
        if (r.status === 'passed') acc.passed += 1;
        else acc.failed += 1;
        return acc;
    }, { total: 0, passed: 0, failed: 0 });


    return (
        <div className="test-results" ref={containerRef}>
            {/* O título da seção "Resultados dos Testes" só é exibido no modo normal, não na exportação. */}
            {!isExportMode && <h2 className="section-title">Resultados dos Testes</h2>}

            {/* Cards de resumo (total, passou, falhou) - visíveis apenas no modo normal. */}
            {!isExportMode && (
                <div className="test-summary">
                    <SummaryCard title="Total" value={displayedSummary.total} colorClass="total" />
                    <SummaryCard title="Passou" value={displayedSummary.passed} colorClass="passed" />
                    <SummaryCard title="Falhou" value={displayedSummary.failed} colorClass="failed" />
                </div>
            )}

            {/* Container para a lista de resultados individuais. */}
            <div className="results-container">
                {/* Exibe mensagens de estado (carregando, nenhum teste) ou a lista de resultados. */}
                {displayedResults.length === 0 ? (
                    isLoading
                        ? <p className="text-muted">Executando...</p>
                        : <p className="text-muted">Nenhum teste executado ainda.</p>
                ) : (
                    // Mapeia e renderiza cada resultado de teste.
                    displayedResults.map(result => {
                        if (result.type === 'functional') {
                            // Para testes funcionais, reutiliza o componente ResultCard para manter a estilização completa.
                            return <ResultCard key={result.id} result={result} />;
                        } else if (result.type === 'performance') {
                            // Para testes de performance, renderiza um card customizado com métricas específicas.
                            return (
                                <div key={result.id} className={`test-result ${result.status}`}>
                                    <h4>
                                        <span>{result.name}</span>
                                        <span className="test-status">
                                            {/* Ícone de sucesso/falha para o resultado geral do teste de performance. */}
                                            {result.status === 'passed' ? <CheckCircleIcon /> : <XCircleIcon />}
                                            <span>{result.status === 'passed' ? 'Passou' : 'Falhou'}</span>
                                        </span>
                                    </h4>
                                    {/* Exibe URL e Método do teste de performance, que agora são armazenados em result.config. */}
                                    <p><strong>URL:</strong> {result.config?.url || 'N/A'}</p>
                                    <p><strong>Método:</strong> {result.config?.method || 'N/A'}</p>
                                    <p><strong>Timestamp:</strong> {result.timestamp}</p>
                                    <p><strong>Mensagem:</strong> {result.message}</p>

                                    {/* Exibe as métricas de performance se existirem. */}
                                    {result.metrics && (
                                        <div className="performance-metrics">
                                            <h5>Métricas de Performance:</h5>
                                            <ul>
                                                <li><strong>Tempo Total:</strong> {result.metrics.totalDuration}ms</li>
                                                <li><strong>Tempo Médio de Resposta:</strong> {result.metrics.averageResponseTime}ms</li>
                                                <li><strong>Taxa de Erros:</strong> {result.metrics.errorRate}%</li>
                                                <li><strong>Throughput:</strong> {result.metrics.throughput} req/s</li>
                                                <li><strong>Requisições Sucesso:</strong> {result.metrics.successfulRequests}</li>
                                                <li><strong>Requisições Falha:</strong> {result.metrics.failedRequests}</li>
                                            </ul>
                                        </div>
                                    )}
                                    {/* Exibe mensagem de erro se houver. */}
                                    {result.error && <p className="text-muted">Erro: {result.error}</p>}
                                </div>
                            );
                        }
                        return null; // Retorna null para tipos de teste desconhecidos.
                    })
                )}
            </div>
        </div>
    );
};

export default ResultsDisplay;