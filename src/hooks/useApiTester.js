import { useState, useRef, useCallback, useMemo } from 'react';

// Função para executar validações nos resultados da API
// Verifica content-type, tempo de resposta e estrutura JSON
const runValidations = (response, config) => {
    const validations = [];
    const { headers, data, duration } = response;
    const contentType = headers['content-type'] || '';

    // Validação de Content-Type
    const isJson = contentType.includes('application/json');
    validations.push({ name: 'Content-Type é JSON', passed: isJson, message: `Tipo: ${contentType}` });

    // Validação de Tempo de Resposta (se definido)
    if (config.maxResponseTime && config.maxResponseTime > 0) {
        const passed = duration <= config.maxResponseTime;
        validations.push({ name: 'Tempo de Resposta', passed, message: `Duração: ${duration}ms (Limite: ${config.maxResponseTime}ms)` });
    }

    // Validação de Estrutura do JSON
    if (isJson && data) {
        const isValidStructure = (data !== null && (typeof data === 'object' || Array.isArray(data)));
        validations.push({ name: 'Estrutura do Body é JSON', passed: isValidStructure, message: isValidStructure ? 'Válido.' : 'Inválido.' });
    }
    return validations;
};

// Hook personalizado para gerenciar testes de API
export const useApiTester = () => {
    // Estados para armazenar resultados e status de carregamento
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const testCounter = useRef(0); // Contador de testes executados

    // Memoização da função de validação para evitar recriações desnecessárias
    const memoizedRunValidations = useCallback((response, config) => {
        return runValidations(response, config);
    }, []);

    // Função para executar um teste de API
    const runTest = useCallback(async (config) => {
        setIsLoading(true);
        testCounter.current += 1;

        const startTime = performance.now();
        let testResult = {
            id: testCounter.current,
            name: config.name || `Teste #${testCounter.current}`,
            timestamp: new Date().toLocaleString('pt-BR'),
            status: 'running',
            ...config,
        };

        try {
            // Validação e parse de headers
            let parsedHeaders = {};
            if (config.headers) {
                try {
                    parsedHeaders = JSON.parse(config.headers);
                } catch (headerError) {
                    throw new Error(`Erro ao processar headers JSON: ${headerError.message}`);
                }
            }
            
            // Validação e parse do body
            let parsedBody = undefined;
            if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
                try {
                    parsedBody = JSON.parse(config.body);
                    if (!parsedHeaders['Content-Type']) {
                        parsedHeaders['Content-Type'] = 'application/json';
                    }
                } catch (bodyError) {
                    throw new Error(`Erro ao processar body JSON: ${bodyError.message}`);
                }
            }

            // Configuração da requisição fetch
            const fetchOptions = {
                method: config.method,
                headers: parsedHeaders,
                body: ['POST', 'PUT', 'PATCH'].includes(config.method) ? config.body : undefined,
            };

            // Execução da requisição
            const response = await fetch(config.url, fetchOptions);
            const responseText = await response.text();
            const endTime = performance.now();

            // Tentativa de parse da resposta como JSON
            let responseData = null;
            try { 
                responseData = JSON.parse(responseText); 
            } catch { 
                responseData = responseText; 
            }

            // Processamento dos headers e cálculo da duração
            const responseHeaders = Object.fromEntries(response.headers.entries());
            const duration = parseFloat((endTime - startTime).toFixed(2));

            // Armazenamento dos dados da resposta
            testResult.response = { status: response.status, statusText: response.statusText, headers: responseHeaders, data: responseData, duration };

            // Verificação do status esperado
            const expectedStatuses = Array.isArray(config.expectedStatus) ? config.expectedStatus : [config.expectedStatus];
            const statusPassed = expectedStatuses.includes(response.status);

            // Execução das validações
            const validations = memoizedRunValidations(testResult.response, config);
            const validationsPassed = validations.every(v => v.passed);

            // Determinação do resultado final do teste
            if (statusPassed && validationsPassed) {
                testResult.status = 'passed';
                testResult.message = `Teste passou com status ${response.status}.`;
            } else {
                testResult.status = 'failed';
                testResult.message = !statusPassed ? `Falhou: Status esperado ${expectedStatuses.join(' ou ')}, recebido ${response.status}.` : 'Falhou: Uma ou mais validações adicionais não passaram.';
            }
            testResult.validations = validations;

        } catch (error) {
            // Tratamento de erros durante a execução do teste
            testResult.status = 'failed';
            testResult.message = `Erro crítico: ${error.message}`;
            testResult.error = error.message;
        } finally {
            setIsLoading(false);
        }

        // Atualização dos resultados (adicionando o novo teste no início da lista)
        setResults(prev => [testResult, ...prev]);
    }, [memoizedRunValidations]);

    // Função para limpar todos os resultados
    const clearResults = useCallback(() => {
        setResults([]);
        testCounter.current = 0;
    }, []);

    // Cálculo do sumário dos resultados (total, passou, falhou)
    const summary = useMemo(() => {
        return results.reduce((acc, r) => {
            acc.total += 1;
            if (r.status === 'passed') acc.passed += 1;
            else acc.failed += 1;
            return acc;
        }, { total: 0, passed: 0, failed: 0 });
    }, [results]);

    // Função para gerar relatório JSON
    const getJsonReport = useCallback(() => {
        if (results.length === 0) return null;

        const report = {
            summary, // Usa o sumário já calculado
            results,
            timestamp: new Date().toISOString(),
        };
        return JSON.stringify(report, null, 2);
    }, [results, summary]);

    // Retorno das funções e estados do hook
    return { results, summary, isLoading, runTest, clearResults, getJsonReport };
};