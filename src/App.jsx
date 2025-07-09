// Importação de hooks e componentes necessários
import { useRef } from 'react';
import { useApiTester } from './hooks/useApiTester.js';
import Header from './components/Header.jsx';
import TestForm from './components/TestForm.jsx';
import ResultsDisplay from './components/ResultsDisplay.jsx';
import { exportToPdf, exportToJson } from './utils/exporters.js';

// Componente principal da aplicação
export default function App() {
    // Desestruturação do hook useApiTester para obter estados e funções
    const { 
        results, // Resultados dos testes
        summary, // Resumo dos resultados (total, passou, falhou)
        isLoading, // Estado de carregamento
        runTest, // Função para executar um teste
        clearResults, // Função para limpar resultados
        getJsonReport // Função para obter relatório em formato JSON
    } = useApiTester();
    
    // Referência para o container de resultados (usado na exportação PDF)
    const resultsContainerRef = useRef(null);

    // Função para exportar resultados em formato JSON
    const handleExportJson = () => {
        const jsonData = getJsonReport();
        if (jsonData) {
            exportToJson(jsonData);
        } else {
            alert('Não há resultados para exportar.');
        }
    };
    
    // Função para exportar resultados em formato PDF
    const handleExportPdf = async () => {
        if (results.length > 0) {
            try {
                await exportToPdf(resultsContainerRef.current);
            } catch (error) {
                console.error('Erro na exportação PDF:', error);
                alert(`Erro ao exportar PDF: ${error.message}`);
            }
        } else {
            alert('Não há resultados para exportar.');
        }
    };

    // Renderização do componente
    return (
        <div className="container">
            <Header />
            <main className="main-content">
                <TestForm 
                    onRunTest={runTest} 
                    onClear={clearResults} 
                    onExportJson={handleExportJson}
                    onExportPdf={handleExportPdf}
                    isLoading={isLoading}
                />
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