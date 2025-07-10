import React from 'react'; // Importar React para JSX
// Removido 'useState' local, pois 'config' e 'setConfig' vêm das props.
import { PlayIcon, ClearIcon, PdfIcon, JsonIcon } from './Icons.jsx';

// Componente de formulário para configuração e execução de testes de performance.
// Recebe 'config' e 'setConfig' do hook 'useApiTester' para persistência de dados.
const PerformanceTestForm = ({ config, setConfig, onRunPerformanceTest, onClear, onExportJson, onExportPdf, isLoading }) => {
    // 'config' e 'setConfig' agora são passados como props, gerenciados centralmente pelo hook useApiTester.

    // Função para atualizar o estado da configuração quando os campos do formulário mudam.
    // Utiliza 'setConfig' recebido via props para atualizar o estado no hook pai.
    const handleChange = (e) => {
        const { id, value } = e.target;
        setConfig(prev => ({ ...prev, [id]: value }));
    };

    // Função para processar o envio do formulário de performance.
    // Previne o comportamento padrão do formulário e chama a função de execução de teste do hook.
    const handleSubmit = (e) => {
        e.preventDefault();
        // A lógica de parsing e validação dos inputs foi movida para o hook 'useApiTester' para centralização.
        // Este componente agora apenas aciona a execução do teste, que usará a 'config' atual do hook.
        onRunPerformanceTest(); // Chama a função do hook, que usará a config do próprio hook.
    };

    // Renderização do formulário de testes de performance.
    return (
        <form onSubmit={handleSubmit} className="test-config-form">
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
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                    <option>PATCH</option>
                </select>
            </div>

            {/* Campo: Headers (JSON) */}
            <div className="form-group">
                <label htmlFor="headers">Headers (JSON)</label>
                <textarea id="headers" value={config.headers} onChange={handleChange} rows="3"></textarea>
            </div>

            {/* Campo: Body da Requisição (JSON) */}
            <div className="form-group">
                <label htmlFor="body">Request Body (JSON)</label>
                <textarea id="body" value={config.body} onChange={handleChange} rows="4"></textarea>
            </div>

            {/* Campos: Status Esperado, Tempo Máximo, Qtd. Requisições, Concorrência */}
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                    {/* Exibe 'Executando...' ou o ícone e texto 'Iniciar Teste de Performance' */}
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