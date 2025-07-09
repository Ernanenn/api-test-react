import { useState } from 'react';
import { PlayIcon, ClearIcon, PdfIcon, JsonIcon } from './Icons.jsx';

// Componente de formulário para configuração e execução de testes de API
const TestForm = ({ onRunTest, onClear, onExportJson, onExportPdf, isLoading }) => {
    // Estado para armazenar a configuração do teste
    const [config, setConfig] = useState({
        url: 'https://example.com/', // URL padrão para teste
        method: 'GET', // Método HTTP padrão
        headers: '{"Content-Type": "application/json"}', // Headers padrão
        body: '', // Corpo da requisição (vazio por padrão)
        expectedStatus: '200', // Status HTTP esperado
        maxResponseTime: '2000', // Tempo máximo de resposta em ms
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
            expectedStatus = JSON.parse(config.expectedStatus);
        } catch {
            expectedStatus = parseInt(config.expectedStatus, 10);
        }
        // Chama a função de execução do teste com os parâmetros configurados
        onRunTest({ ...config, expectedStatus: expectedStatus || 200, maxResponseTime: parseInt(config.maxResponseTime, 10) || null });
    };

    // Renderização do formulário
    return (
        <form onSubmit={handleSubmit} className="test-config">
            <h2 className="section-title">Configuração do Teste</h2>
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
            {/* Campos: Status Esperado e Tempo Máximo */}
            <div className="form-group" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                    <label htmlFor="expectedStatus">Status Esperado</label>
                    <input type="text" id="expectedStatus" value={config.expectedStatus} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="maxResponseTime">Tempo Máximo (ms)</label>
                    <input type="number" id="maxResponseTime" value={config.maxResponseTime} onChange={handleChange} />
                </div>
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