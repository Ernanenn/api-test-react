// Importação de hooks e componentes necessários
import React from 'react';
import { useRef, useState, useCallback } from 'react'; // Adicionado useState e useCallback
import { useApiTester } from './hooks/useApiTester.js';
import Header from './components/Header.jsx';
import TestForm from './components/TestForm.jsx';
import PerformanceTestForm from './components/PerformanceTestForm.jsx'; // Novo componente
import ResultsDisplay from './components/ResultsDisplay.jsx';
import { exportToPdf, exportToJson } from './utils/exporters.js';

// Componente principal da aplicação
export default function App() {
    // Estado para controlar a aba ativa: 'functional' ou 'performance'
    const [activeTab, setActiveTab] = useState('functional');

    // Desestruturação do hook useApiTester para obter estados e funções
    const { 
        results, // Resultados dos testes
        summary, // Resumo dos resultados (total, passou, falhou)
        isLoading, // Estado de carregamento
        runTest, // Função para executar um teste funcional
        runPerformanceTest, // Nova função para executar testes de performance
        clearResults, // Função para limpar resultados
        getJsonReport // Função para obter relatório em formato JSON
    } = useApiTester();
    
    // Referência para o container de resultados (usado na exportação PDF)
    const resultsContainerRef = useRef(null);

    // Função para exportar resultados em formato JSON
    const handleExportJson = useCallback(() => {
        const jsonData = getJsonReport();
        if (jsonData) {
            exportToJson(jsonData);
            // Em uma aplicação real, você usaria um sistema de notificação aqui, não alert.
            console.log('Relatório JSON exportado com sucesso!');
        } else {
            console.warn('Não há resultados para exportar.');
            // Em uma aplicação real, você usaria um sistema de notificação aqui, não alert.
        }
    }, [getJsonReport]);
    
    // Função para exportar resultados em formato PDF
    const handleExportPdf = useCallback(async () => {
        if (results.length > 0) {
            try {
                await exportToPdf(resultsContainerRef.current);
                // Em uma aplicação real, você usaria um sistema de notificação aqui, não alert.
                console.log('Relatório PDF exportado com sucesso!');
            } catch (error) {
                console.error('Erro na exportação PDF:', error);
                // Em uma aplicação real, você usaria um sistema de notificação aqui, não alert.
            }
        } else {
            console.warn('Não há resultados para exportar.');
            // Em uma aplicação real, você usaria um sistema de notificação aqui, não alert.
        }
    }, [results.length]); // Dependência adicionada para results.length

    // Renderização do componente
    return (
        <div className="container">
            <Header />
            <main className="main-content">
                <div className="test-config">
                    {/* Abas de navegação */}
                    <div className="tab-navigation">
                        <button 
                            className={`tab-button ${activeTab === 'functional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('functional')}
                        >
                            Testes Funcionais
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('performance')}
                        >
                            Testes de Performance
                        </button>
                    </div>

                    {/* Renderiza o formulário da aba ativa */}
                    {activeTab === 'functional' ? (
                        <TestForm 
                            onRunTest={runTest} 
                            onClear={clearResults} 
                            onExportJson={handleExportJson}
                            onExportPdf={handleExportPdf}
                            isLoading={isLoading}
                        />
                    ) : (
                        <PerformanceTestForm
                            onRunPerformanceTest={runPerformanceTest}
                            onClear={clearResults}
                            onExportJson={handleExportJson}
                            onExportPdf={handleExportPdf}
                            isLoading={isLoading}
                        />
                    )}
                </div>
                <ResultsDisplay 
                    results={results} 
                    summary={summary}
                    isLoading={isLoading}
                    containerRef={resultsContainerRef}
                />
            </main>
        </div>
    );
}