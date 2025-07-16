// Importação de hooks e componentes necessários do React.
import React from 'react';
import { useRef, useState, useCallback } from 'react';

// Importação do hook personalizado para lógica de testes.
import { useApiTester } from './hooks/useApiTester.js';

// Importação dos componentes da interface de usuário.
import Header from './components/Header.jsx';
import TestForm from './components/TestForm.jsx';
import PerformanceTestForm from './components/PerformanceTestForm.jsx';
import ResultsDisplay from './components/ResultsDisplay.jsx';
import Footer from './components/Footer.jsx'; // NOVO: Importa o componente Footer

// Importação das funções de exportação.
import { exportToPdf, exportToJson } from './utils/exporters.js';

// Componente principal da aplicação.
export default function App() {
    // Estado para controlar qual aba está ativa: 'functional' ou 'performance'.
    const [activeTab, setActiveTab] = useState('functional');

    // Desestruturação do hook useApiTester para obter estados e funções.
    // O hook agora gerencia as configurações dos formulários para persistência.
    const { 
        results, // Lista de resultados de testes.
        summary, // Objeto de resumo dos resultados (total, passou, falhou).
        isLoading, // Booleano que indica se um teste está em andamento.
        runTest, // Função para executar um teste funcional.
        runPerformanceTest, // Função para executar um teste de performance.
        clearResults, // Função para limpar todos os resultados e resetar configurações.
        getJsonReport, // Função para obter relatório em formato JSON, com filtro.
        functionalConfig, // Configuração atual do formulário funcional.
        setFunctionalConfig, // Setter para a configuração do formulário funcional.
        performanceConfig, // Configuração atual do formulário de performance.
        setPerformanceConfig // Setter para a configuração do formulário de performance.
    } = useApiTester();
    
    // Referência para o container principal de resultados visível na UI.
    // Usado para rolar a página ou outras interações diretas com o DOM.
    const resultsContainerRef = useRef(null);
    
    // Referência para um container temporário e oculto.
    // Usado exclusivamente para renderizar o conteúdo a ser exportado para PDF,
    // garantindo que o html2canvas capture apenas o conteúdo filtrado e estilizado corretamente.
    const pdfExportContainerRef = useRef(null);

    // Função para lidar com a exportação de resultados em formato JSON.
    // Usa useCallback para memoizar a função e evitar recriações desnecessárias.
    const handleExportJson = useCallback(() => {
        // Passa o tipo de aba ativa para o 'getJsonReport' para filtrar o relatório JSON.
        const jsonData = getJsonReport(activeTab);
        if (jsonData) {
            exportToJson(jsonData); // Chama a função de exportação JSON.
            console.log(`Relatório JSON (${activeTab}) exportado com sucesso!`);
            // Em uma aplicação real, você usaria um sistema de notificação aqui, não console.log.
        } else {
            console.warn(`Não há resultados (${activeTab}) para exportar.`);
            // Em uma aplicação real, você usaria um sistema de notificação aqui.
        }
    }, [getJsonReport, activeTab]); // Dependências do useCallback.
    
    // Função para lidar com a exportação de resultados em formato PDF.
    // Usa useCallback para memoizar a função e lidar com operações assíncronas.
    const handleExportPdf = useCallback(async () => {
        // Verifica se há resultados para exportar antes de tentar gerar o PDF.
        if (results.length > 0) {
            try {
                // Chama a função de exportação PDF, passando os resultados brutos,
                // o tipo de aba ativa (para filtro) e a referência do container oculto.
                await exportToPdf(results, activeTab, pdfExportContainerRef);
                console.log(`Relatório PDF (${activeTab}) exportado com sucesso!`);
                // Em uma aplicação real, você usaria um sistema de notificação aqui.
            } catch (error) {
                console.error('Erro na exportação PDF:', error);
                // Em uma aplicação real, você usaria um sistema de notificação aqui.
            }
        } else {
            console.warn(`Não há resultados (${activeTab}) para exportar.`);
            // Em uma aplicação real, você usaria um sistema de notificação aqui.
        }
    }, [results, activeTab]); // Dependências do useCallback.

    // Renderização do componente principal da aplicação.
    return (
        <div className="container">
            <Header /> {/* Componente de cabeçalho. */}
            <main className="main-content">
                <div className="test-config">
                    {/* Navegação por abas para alternar entre testes funcionais e de performance. */}
                    <div className="tab-navigation">
                        <button 
                            className={`tab-button ${activeTab === 'functional' ? 'active' : ''}`}
                            onClick={() => {
                                // Limpa os resultados ao trocar de aba para evitar confusão visual.
                                // Os dados dos formulários permanecem persistentes.
                                clearResults();
                                setActiveTab('functional');
                            }}
                        >
                            Testes Funcionais
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                            onClick={() => {
                                // Limpa os resultados ao trocar de aba.
                                clearResults();
                                setActiveTab('performance');
                            }}
                        >
                            Testes de Performance
                        </button>
                    </div>

                    {/* Renderiza o formulário correspondente à aba ativa. */}
                    {activeTab === 'functional' ? (
                        <TestForm 
                            config={functionalConfig} // Passa a configuração persistente do hook.
                            setConfig={setFunctionalConfig} // Passa o setter para atualizar a configuração no hook.
                            onRunTest={runTest} 
                            onClear={clearResults} 
                            onExportJson={handleExportJson}
                            onExportPdf={handleExportPdf}
                            isLoading={isLoading}
                        />
                    ) : (
                        <PerformanceTestForm
                            config={performanceConfig} // Passa a configuração persistente do hook.
                            setConfig={setPerformanceConfig} // Passa o setter para atualizar a configuração no hook.
                            onRunPerformanceTest={runPerformanceTest}
                            onClear={clearResults}
                            onExportJson={handleExportJson}
                            onExportPdf={handleExportPdf}
                            isLoading={isLoading}
                        />
                    )}
                </div>
                {/* Exibição dos resultados dos testes (visível na UI principal). */}
                <ResultsDisplay 
                    results={results} 
                    summary={summary}
                    isLoading={isLoading}
                    containerRef={resultsContainerRef}
                />
            </main>

            {/* Container oculto para renderização de PDF filtrado.
                Este div é posicionado fora da tela para não ser visível,
                mas é usado pelo html2canvas para capturar o conteúdo correto para o PDF.
                Estilo para opacity: 0; pointer-events: none; para melhor compatibilidade com html2canvas. */}
            <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: 0, left: 0, width: '1200px' }}>
                <ResultsDisplay 
                    results={results} 
                    summary={summary} // O sumário pode não ser preciso para resultados filtrados aqui, mas é necessário para o componente.
                    isLoading={false} // Não está em estado de carregamento para a exportação.
                    containerRef={pdfExportContainerRef} // Referência para este container oculto.
                    isExportMode={true} // Propriedade para indicar que está no modo de exportação.
                    exportFilterType={activeTab} // Passa o tipo de aba ativa para filtrar os resultados para o PDF.
                />
            </div>

            <Footer /> {/* Adiciona o componente de rodapé aqui */}
        </div>
    );
}
