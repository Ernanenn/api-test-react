import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons.jsx';

// Componente que exibe o resultado de um teste individual funcional.
// Este componente é reutilizado pelo ResultsDisplay para mostrar os detalhes de cada teste.
const ResultCard = ({ result }) => {
    // Verifica se o status do teste é 'passed' para aplicar estilos e ícones corretos.
    const isSuccess = result.status === 'passed';

    return (
        // Aplica a classe CSS 'success' ou 'error' dinamicamente com base no status do teste.
        <div className={`test-result ${isSuccess ? 'success' : 'error'}`}>
            <h4>
                {/* Nome do teste */}
                <span>{result.name}</span>
                {/* Status do teste com ícone e texto */}
                <span className="test-status">
                    {/* Renderiza o ícone de check ou X com base no sucesso do teste. */}
                    {isSuccess ? <CheckCircleIcon /> : <XCircleIcon />}
                    {/* Exibe o texto 'Passou' ou 'Falhou'. */}
                    <span>{isSuccess ? 'Passou' : 'Falhou'}</span>
                </span>
            </h4>

            {/* Informações básicas do teste */}
            <p><strong>Método:</strong> {result.method} {result.url}</p>
            <p><strong>Timestamp:</strong> {result.timestamp}</p>
            <p><strong>Mensagem:</strong> {result.message}</p>
            {/* Exibe a duração da resposta, buscando em 'response.duration' ou 'duration' diretamente. */}
            <p><strong>Duração:</strong> {result.response?.duration || result.duration}ms</p>

            {/* Exibe a lista de validações se a propriedade 'validations' existir no resultado. */}
            {result.validations && (
                <div className="validations-list">
                    <h5>Validações:</h5>
                    <ul>
                        {/* Mapeia e renderiza cada validação.
                            A 'key={i}' é usada aqui para simplicidade, mas um ID único seria preferível se os itens pudessem ser reordenados. */}
                        {result.validations.map((v, i) => (
                            <li key={i} className={v.passed ? 'success' : 'error'}>
                                {v.name}: {v.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Exibe os dados da resposta da API se 'response.data' existir. */}
            {result.response?.data && (
                <div>
                    <strong>Resposta da API:</strong>
                    <pre>
                        {/* Formata a resposta JSON para ser legível, ou exibe como string se não for JSON. */}
                        {typeof result.response.data === 'string' ? result.response.data : JSON.stringify(result.response.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ResultCard;