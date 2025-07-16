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

    // Função auxiliar para executar uma única requisição de API
    const executeSingleRequest = useCallback(async (config) => {
        const startTime = performance.now();
        let responseData = null;
        let responseStatus = null;
        let responseStatusText = '';
        let responseHeaders = {};
        let duration = 0;
        let errorMessage = null;

        try {
            const fetchOptions = {
                method: config.method,
                headers: config.headers, // Headers já parseados
                body: ['POST', 'PUT', 'PATCH'].includes(config.method) && config.body ? JSON.stringify(config.body) : undefined,
            };

            const response = await fetch(config.url, fetchOptions);
            const responseText = await response.text();
            const endTime = performance.now();
            duration = parseFloat((endTime - startTime).toFixed(2));

            responseStatus = response.status;
            responseStatusText = response.statusText;
            responseHeaders = Object.fromEntries(response.headers.entries());

            try { 
                responseData = JSON.parse(responseText); 
            } catch { 
                responseData = responseText; 
            }

        } catch (error) {
            errorMessage = `Erro de rede/requisição: ${error.message}`;
            duration = parseFloat((performance.now() - startTime).toFixed(2));
        }

        return {
            status: responseStatus,
            statusText: responseStatusText,
            headers: responseHeaders,
            data: responseData,
            duration: duration,
            error: errorMessage
        };
    }, []);


    // Função para executar um teste de API funcional
    const runTest = useCallback(async (config) => {
        setIsLoading(true);
        testCounter.current += 1;

        let testResult = {
            id: testCounter.current,
            name: config.name || `Teste Funcional #${testCounter.current}`,
            timestamp: new Date().toLocaleString('pt-BR'),
            status: 'running',
            ...config,
        };

        try {
            const responseData = await executeSingleRequest(config);

            if (responseData.error) {
                throw new Error(responseData.error);
            }

            testResult.response = responseData;

            // Verificação do status esperado
            const expectedStatuses = Array.isArray(config.expectedStatus) ? config.expectedStatus : [config.expectedStatus];
            const statusPassed = expectedStatuses.includes(responseData.status);

            // Execução das validações
            const validations = memoizedRunValidations(testResult.response, config);
            const validationsPassed = validations.every(v => v.passed);

            // Determinação do resultado final do teste
            if (statusPassed && validationsPassed) {
                testResult.status = 'passed';
                testResult.message = `Teste funcional passou com status ${responseData.status}.`;
            } else {
                testResult.status = 'failed';
                testResult.message = !statusPassed ? `Falhou: Status esperado ${expectedStatuses.join(' ou ')}, recebido ${responseData.status}.` : 'Falhou: Uma ou mais validações adicionais não passaram.';
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
    }, [memoizedRunValidations, executeSingleRequest]);

    // Nova função para executar um teste de performance
    const runPerformanceTest = useCallback(async (config) => {
        setIsLoading(true);
        testCounter.current += 1;

        const { numberOfRequests, concurrency } = config;
        const requestQueue = [];
        const allDurations = [];
        let successfulRequests = 0;
        let failedRequests = 0;

        let performanceTestResult = {
            id: testCounter.current,
            name: config.name || `Teste de Performance #${testCounter.current}`,
            method: config.method,
            url: config.url,
            timestamp: new Date().toLocaleString('pt-BR'),
            type: 'performance', // Identificador de tipo de teste
            status: 'running',
            config: config,
            metrics: {}, // Métricas de performance
            individualResults: [] // Opcional: resultados de cada requisição
        };

        setResults(prev => [performanceTestResult, ...prev]); // Adiciona o resultado inicial

        try {
            const startTime = performance.now();

            // Criar um pool de Promises para controlar a concorrência
            const pLimit = (limit) => {
                const queue = [];
                let active = 0;

                const next = () => {
                    active--;
                    if (queue.length > 0) {
                        queue.shift()();
                    }
                };

                return (fn) => new Promise((resolve, reject) => {
                    const run = async () => {
                        active++;
                        try {
                            resolve(await fn());
                        } catch (err) {
                            reject(err);
                        } finally {
                            next();
                        }
                    };

                    if (active < limit) {
                        run();
                    } else {
                        queue.push(run);
                    }
                });
            };

            const limit = pLimit(concurrency);
            const requests = Array.from({ length: numberOfRequests }, (_, i) => 
                limit(() => executeSingleRequest(config).then(response => {
                    performanceTestResult.individualResults.push(response); // Coleta resultados individuais
                    allDurations.push(response.duration);
                    
                    const expectedStatuses = Array.isArray(config.expectedStatus) ? config.expectedStatus : [config.expectedStatus];
                    if (expectedStatuses.includes(response.status) && !response.error) {
                        successfulRequests++;
                    } else {
                        failedRequests++;
                    }
                    return response; // Retorna a resposta para Promise.all
                }))
            );
            
            await Promise.allSettled(requests); // Usa allSettled para não parar no primeiro erro

            const endTime = performance.now();
            const totalDuration = parseFloat((endTime - startTime).toFixed(2));

            const averageResponseTime = allDurations.length > 0 
                ? parseFloat((allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length).toFixed(2))
                : 0;
            const errorRate = numberOfRequests > 0 
                ? parseFloat(((failedRequests / numberOfRequests) * 100).toFixed(2))
                : 0;
            const throughput = totalDuration > 0 
                ? parseFloat(((numberOfRequests / (totalDuration / 1000))).toFixed(2)) // req/seg
                : 0;

            performanceTestResult.status = failedRequests > 0 ? 'failed' : 'passed';
            performanceTestResult.message = `Teste de performance concluído. Total: ${numberOfRequests}, Sucesso: ${successfulRequests}, Falha: ${failedRequests}.`;
            performanceTestResult.metrics = {
                averageResponseTime,
                errorRate,
                throughput,
                totalDuration,
                successfulRequests,
                failedRequests
            };

        } catch (error) {
            performanceTestResult.status = 'failed';
            performanceTestResult.message = `Erro crítico no teste de performance: ${error.message}`;
            performanceTestResult.error = error.message;
        } finally {
            setIsLoading(false);
            // Atualiza o resultado final na lista
            setResults(prev => prev.map(res => res.id === performanceTestResult.id ? performanceTestResult : res));
        }
    }, [executeSingleRequest]); // Dependência do executeSingleRequest

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
    return { results, summary, isLoading, runTest, runPerformanceTest, clearResults, getJsonReport };
};
