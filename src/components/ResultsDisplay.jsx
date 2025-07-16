import React from 'react';
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
                results.map(result => (
                    <div key={result.id} className={`test-result ${result.status}`}>
                        <h4>
                            <span>{result.name}</span>
                            <span className="test-status">
                                {result.type === 'performance' ? 'Performance' : (result.status === 'passed' ? 'Passou' : 'Falhou')}
                                {/* Ícones para testes funcionais já estão no ResultCard, mas para performance podemos adaptar */}
                            </span>
                        </h4>
                        <p><strong>URL:</strong> {result.url}</p>
                        <p><strong>Método:</strong> {result.method}</p>
                        <p><strong>Timestamp:</strong> {result.timestamp}</p>
                        <p><strong>Mensagem:</strong> {result.message}</p>

                        {result.type === 'performance' && result.metrics && (
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
                                {/* Opcional: Mostrar detalhes de requisições individuais se result.individualResults for grande */}
                            </div>
                        )}

                        {result.type !== 'performance' && (
                            <>
                                <p><strong>Duração:</strong> {result.response?.duration || result.duration}ms</p>
                                {/* Exibe as validações se existirem */}
                                {result.validations && (
                                    <div className="validations-list">
                                        <h5>Validações:</h5>
                                        <ul>
                                            {result.validations.map((v, i) => (
                                                <li key={i} className={v.passed ? 'success' : 'error'}>
                                                    {v.name}: {v.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Exibe os dados da resposta se existirem */}
                                {result.response?.data && (
                                    <div>
                                        <strong>Resposta da API:</strong>
                                        <pre>
                                            {typeof result.response.data === 'string' ? result.response.data : JSON.stringify(result.response.data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
);

export default ResultsDisplay;
