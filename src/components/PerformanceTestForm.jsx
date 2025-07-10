import React from 'react';
import { useState } from 'react';
import { PlayIcon, ClearIcon, PdfIcon, JsonIcon } from './Icons.jsx';

// Componente de formulário para configuração e execução de testes de performance
const PerformanceTestForm = ({ onRunPerformanceTest, onClear, onExportJson, onExportPdf, isLoading }) => {
    // Estado para armazenar a configuração do teste de performance
    const [config, setConfig] = useState({
        url: 'https://example.com/', // URL padrão para teste
        method: 'GET', // Método HTTP padrão
        headers: '{"Content-Type": "application/json"}', // Headers padrão
        body: '', // Corpo da requisição (vazio por padrão)
        expectedStatus: '200', // Status HTTP esperado
        maxResponseTime: '2000', // Tempo máximo de resposta em ms
        numberOfRequests: '10', // Quantidade de requisições
        concurrency: '5', // Requisições simultâneas
        name: 'Teste de Performance', // Nome do teste
    });

    // Função para atualizar o estado quando os campos do formulário mudam
    const handleChange = (e) => {
        const { id, value } = e.target;
        setConfig(prev => ({ ...prev, [id]: value }));
    };

    // Função para processar o envio do formulário de performance
    const handleSubmit = (e) => {
        e.preventDefault();
        
        let parsedExpectedStatus;
        try {
            const jsonParsed = JSON.parse(config.expectedStatus);
            if (Array.isArray(jsonParsed) || typeof jsonParsed === 'number') {
                parsedExpectedStatus = jsonParsed;
            } else {
                parsedExpectedStatus = parseInt(config.expectedStatus, 10);
            }
        } catch (err) {
            parsedExpectedStatus = parseInt(config.expectedStatus, 10);
        }
        if (isNaN(parsedExpectedStatus) && typeof parsedExpectedStatus !== 'object') {
            parsedExpectedStatus = 200; // Padrão se o parse falhar
        }

        const parsedMaxResponseTime = parseInt(config.maxResponseTime, 10);
        const parsedNumberOfRequests = parseInt(config.numberOfRequests, 10);
        const parsedConcurrency = parseInt(config.concurrency, 10);

        // Validação de JSON para headers e body (simplificada para este exemplo)
        let parsedHeaders = {};
        try {
            parsedHeaders = config.headers ? JSON.parse(config.headers) : {};
        } catch (err) {
            console.error('Erro: Headers JSON inválido.', err);
            // Em uma aplicação real, você mostraria um erro na UI
            return;
        }

        let parsedBody = undefined;
        if (config.body) {
            try {
                parsedBody = JSON.parse(config.body);
            } catch (err) {
                console.error('Erro: Request Body JSON inválido.', err);
                // Em uma aplicação real, você mostraria um erro na UI
                return;
            }
        }

        onRunPerformanceTest({ 
            ...config, 
            headers: parsedHeaders,
            body: parsedBody, // Passa o objeto parseado
            expectedStatus: parsedExpectedStatus,
            maxResponseTime: isNaN(parsedMaxResponseTime) ? null : parsedMaxResponseTime,
            numberOfRequests: isNaN(parsedNumberOfRequests) ? 10 : parsedNumberOfRequests,
            concurrency: isNaN(parsedConcurrency) ? 5 : parsedConcurrency,
        });
    };

    // Renderização do formulário
    return (
        <form onSubmit={handleSubmit} className="test-config-form"> {/* Nova classe para diferenciar */}
            <h2 className="section-title">Configuração de Performance</h2>
            {/* Campo: Nome do Teste */}
            <div className="form-group">
                <label htmlFor="name">Nome do Teste</label>
                <input type="text" id="name" value={config.name} onChange={handleChange} />
            </div>
            {/* Campo: URL da API */}
            <div className="form-group">
                <label htmlFor="url">URL da API</label>
                <input type="url" id="url" value={config.url} onChange={handleChange} required />
            </div>
            {/* Campo: Método HTTP */}
            <div className="form-group">
                <label htmlFor="method">Método HTTP</label>
                <select id="method" value={config.method} onChange={handleChange}>
                    <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option>
                </select>
            </div>
            {/* Campo: Headers */}
            <div className="form-group">
                <label htmlFor="headers">Headers (JSON)</label>
                <textarea id="headers" value={config.headers} onChange={handleChange} rows="3"></textarea>
            </div>
            {/* Campo: Body da Requisição */}
            <div className="form-group">
                <label htmlFor="body">Request Body (JSON)</label>
                <textarea id="body" value={config.body} onChange={handleChange} rows="4"></textarea>
            </div>
            {/* Campos: Status Esperado, Tempo Máximo, Qtd. Requisições, Concorrência */}
            <div className="form-group" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                    <label htmlFor="expectedStatus">Status Esperado</label>
                    <input type="text" id="expectedStatus" value={config.expectedStatus} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="maxResponseTime">Tempo Máximo (ms)</label>
                    <input type="number" id="maxResponseTime" value={config.maxResponseTime} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="numberOfRequests">Qtd. Requisições</label>
                    <input type="number" id="numberOfRequests" value={config.numberOfRequests} onChange={handleChange} min="1" />
                </div>
                <div>
                    <label htmlFor="concurrency">Concorrência</label>
                    <input type="number" id="concurrency" value={config.concurrency} onChange={handleChange} min="1" />
                </div>
            </div>
            {/* Botões de ação */}
            <div className="button-group">
                <button type="submit" disabled={isLoading} className="btn">
                    {isLoading ? 'Executando...' : <><PlayIcon /> Iniciar Teste de Performance</>}
                </button>
                <button type="button" onClick={onClear} className="btn btn-warning">
                    <ClearIcon /> Limpar
                </button>
                <button type="button" onClick={onExportJson} className="btn btn-export">
                    <JsonIcon /> JSON
                </button>
                <button type="button" onClick={onExportPdf} className="btn btn-export">
                    <PdfIcon /> PDF
                </button>
            </div>
        </form>
    );
};

export default PerformanceTestForm;
