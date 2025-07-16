import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons.jsx';

// Componente que exibe o resultado de um teste individual
const ResultCard = ({ result }) => {
    // Verifica se o teste foi bem-sucedido
    const isSuccess = result.status === 'passed';
    return (
        <div className={`test-result ${isSuccess ? 'success' : 'error'}`}>
            <h4>
                <span>{result.name}</span>
                <span className="test-status">
                    {isSuccess ? <CheckCircleIcon /> : <XCircleIcon />}
                    <span>{isSuccess ? 'Passou' : 'Falhou'}</span>
                </span>
            </h4>
            {/* Informações básicas do teste */}
            <p><strong>Método:</strong> {result.method}</p>
            <p><strong>URL:</strong> {result.url}</p>
            <p><strong>Timestamp:</strong> {result.timestamp}</p>
            <p><strong>Mensagem:</strong> {result.message}</p>
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
        </div>
    );
};

export default ResultCard;