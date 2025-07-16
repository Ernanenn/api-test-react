import React from 'react';
import { useState } from 'react';
import { PlayIcon, ClearIcon, PdfIcon, JsonIcon } from './Icons.jsx';

// Componente de formulário para configuração e execução de testes de API
const TestForm = ({ onRunTest, onClear, onExportJson, onExportPdf, isLoading }) => {
    // Estado para armazenar a configuração do teste
    const [config, setConfig] = useState({
        url: 'https://example.com/', // URL padrão para teste
        method: 'GET', // Método HTTP padrão
        headers: '{"Content-Type": "application/json"}', // Headers padrão
        body: '{"key": "value"}', // Corpo da requisição (vazio por padrão)
        expectedStatus: '200', // Status HTTP esperado
        name: 'Meu Teste', // Nome do teste
    });

    // Função para atualizar o estado quando os campos do formulário mudam
    const handleChange = (e) => {
        const { id, value } = e.target;
        setConfig(prev => ({ ...prev, [id]: value }));
    };

    // Função para processar o envio do formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        let expectedStatus;
        try {
            // Tenta converter o status esperado para um array ou número
            const jsonParsed = JSON.parse(config.expectedStatus);
            if (Array.isArray(jsonParsed) || typeof jsonParsed === 'number') {
                expectedStatus = jsonParsed;
            } else {
                expectedStatus = parseInt(config.expectedStatus, 10);
            }
        } catch {
            expectedStatus = parseInt(config.expectedStatus, 10);
        }
        // Garante que é um array ou um número. Se for NaN, usa o padrão 200.
        if (isNaN(expectedStatus) && typeof expectedStatus !== 'object') {
            expectedStatus = 200;
        }

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

        // Chama a função de execução do teste com os parâmetros configurados
        onRunTest({ 
            ...config, 
            headers: parsedHeaders,
            body: parsedBody, // Passa o objeto parseado
            expectedStatus: expectedStatus
        });
    };

    // Renderização do formulário
    return (
        <form onSubmit={handleSubmit} className="test-config-form">
            <h2 className="section-title">Configuração do Teste Funcional</h2>
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
            {/* Campo: Status Esperado */}
            <div className="form-group">
                <label htmlFor="expectedStatus">Status Esperado</label>
                <input type="text" id="expectedStatus" value={config.expectedStatus} onChange={handleChange} />
            </div>
            {/* Botões de ação */}
            <div className="button-group">
                <button type="submit" disabled={isLoading} className="btn">
                    {isLoading ? 'Executando...' : <><PlayIcon /> Executar Teste</>}
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

export default TestForm;
