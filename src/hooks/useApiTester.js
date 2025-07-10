import { useState, useRef, useCallback, useMemo } from 'react';

// Função auxiliar para executar validações nos resultados da API.
// Verifica content-type, tempo de resposta e estrutura JSON.
const runValidations = (response, config) => {
    const validations = [];
    const { headers, data, duration } = response;
    const contentType = headers['content-type'] || '';

    // Validação de Content-Type: Verifica se a resposta é JSON.
    const isJson = contentType.includes('application/json');
    validations.push({ name: 'Content-Type é JSON', passed: isJson, message: `Tipo: ${contentType}` });

    // Validação de Tempo de Resposta: Verifica se a duração está dentro do limite configurado.
    // Esta validação é aplicada tanto para testes funcionais quanto para requisições individuais de performance.
    if (config.maxResponseTime && config.maxResponseTime > 0) {
        const passed = duration <= config.maxResponseTime;
        validations.push({ name: 'Tempo de Resposta', passed, message: `Duração: ${duration}ms (Limite: ${config.maxResponseTime}ms)` });
    }

    // Validação de Estrutura do JSON: Se for JSON, verifica se os dados têm uma estrutura válida (objeto ou array).
    if (isJson && data) {
        const isValidStructure = (data !== null && (typeof data === 'object' || Array.isArray(data)));
        validations.push({ name: 'Estrutura do Body é JSON', passed: isValidStructure, message: isValidStructure ? 'Válido.' : 'Inválido.' });
    }
    return validations;
};

// Hook personalizado para gerenciar testes de API (funcionais e de performance).
export const useApiTester = () => {
    // Estados para armazenar resultados dos testes e o status de carregamento.
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const testCounter = useRef(0); // Contador para gerar IDs únicos para os testes.

    // Configurações dos formulários:
    // Mantidas no estado do hook para persistir os dados ao trocar de abas.
    const [functionalConfig, setFunctionalConfig] = useState({
        url: 'https://example.com/',
        method: 'GET',
        headers: '{"Content-Type": "application/json"}',
        body: '{"Key": "Value"}',
        expectedStatus: '200',
        name: 'Meu Teste Funcional',
    });

    const [performanceConfig, setPerformanceConfig] = useState({
        url: 'https://example.com/',
        method: 'GET',
        headers: '{"Content-Type": "application/json"}',
        body: '{"Key": "Value"}',
        expectedStatus: '200',
        maxResponseTime: '2000',
        numberOfRequests: '10',
        concurrency: '5',
        name: 'Meu Teste de Performance',
    });

    // Memoização da função de validação para evitar recriações desnecessárias.
    const memoizedRunValidations = useCallback((response, config) => {
        return runValidations(response, config);
    }, []);

    // Função auxiliar para executar uma única requisição de API.
    // Retorna o resultado completo da requisição, incluindo status de validação.
    const executeSingleRequest = useCallback(async (configToUse) => {
        const startTime = performance.now(); // Inicia a contagem do tempo.
        let responseData = null;
        let responseStatus = null;
        let responseStatusText = '';
        let responseHeaders = {};
        let duration = 0;
        let errorMessage = null;
        let individualPassed = true; // Novo: status de passagem individual da requisição

        try {
            const fetchOptions = {
                method: configToUse.method,
                headers: configToUse.headers, // Headers já parseados (objeto).
                // O corpo da requisição é stringificado APENAS se for um método que requer body e o body não for nulo/indefinido.
                body: ['POST', 'PUT', 'PATCH'].includes(configToUse.method) && configToUse.body ? JSON.stringify(configToUse.body) : undefined,
            };

            const response = await fetch(configToUse.url, fetchOptions); // Executa a requisição.
            const responseText = await response.text(); // Obtém o corpo da resposta como texto.
            const endTime = performance.now(); // Finaliza a contagem do tempo.
            duration = parseFloat((endTime - startTime).toFixed(2)); // Calcula a duração.

            responseStatus = response.status; // Status HTTP da resposta.
            responseStatusText = response.statusText; // Texto do status HTTP.
            responseHeaders = Object.fromEntries(response.headers.entries()); // Converte headers para um objeto.

            // Tenta parsear a resposta como JSON; se falhar, mantém como texto bruto.
            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = responseText;
            }

            // Validação de status HTTP para a requisição individual
            const expectedStatuses = Array.isArray(configToUse.expectedStatus) ? configToUse.expectedStatus : [configToUse.expectedStatus];
            const statusPassed = expectedStatuses.includes(responseStatus);

            // Validações adicionais (Content-Type, tempo de resposta, estrutura JSON) para a requisição individual
            const individualValidations = runValidations({
                status: responseStatus,
                headers: responseHeaders,
                data: responseData,
                duration: duration
            }, configToUse); // Passa a config completa para runValidations

            const individualValidationsPassed = individualValidations.every(v => v.passed);

            // Determina se a requisição individual passou
            if (!statusPassed || !individualValidationsPassed) {
                individualPassed = false;
                errorMessage = `Requisição falhou: Status esperado ${expectedStatuses.join(' ou ')}, recebido ${responseStatus}. ` +
                    (individualValidationsPassed ? '' : individualValidations.filter(v => !v.passed).map(v => v.message).join('; '));
            }


        } catch (error) {
            // Captura erros de rede ou de requisição.
            errorMessage = `Erro de rede/requisição: ${error.message}`;
            duration = parseFloat((performance.now() - startTime).toFixed(2)); // Garante que a duração seja registrada mesmo em erro.
            individualPassed = false; // Requisição falhou devido a erro crítico
        }

        // Retorna um objeto com todos os detalhes da resposta, incluindo o status de passagem individual.
        return {
            status: responseStatus,
            statusText: responseStatusText,
            headers: responseHeaders,
            data: responseData,
            duration: duration,
            error: errorMessage,
            passed: individualPassed // Novo: Indica se esta requisição individual passou
        };
    }, []);


    // Função para executar um teste de API funcional (usa functionalConfig do estado)
    const runTest = useCallback(async () => {
        setIsLoading(true); // Define o estado de carregamento.
        testCounter.current += 1; // Incrementa o contador de testes para um ID único.

        // --- Validação e parsing dos inputs do functionalConfig ---
        // Esta lógica foi movida para o hook para centralizar e garantir que os dados
        // passados para 'executeSingleRequest' estejam no formato correto.
        let parsedHeaders = {};
        try {
            parsedHeaders = functionalConfig.headers ? JSON.parse(functionalConfig.headers) : {};
        } catch (err) {
            setIsLoading(false);
            // Adiciona um resultado de falha imediato se o JSON dos headers for inválido.
            setResults(prev => [{
                id: testCounter.current,
                name: functionalConfig.name || `Teste Funcional #${testCounter.current}`,
                timestamp: new Date().toLocaleString('pt-BR'),
                status: 'failed',
                message: `Erro ao processar headers JSON: ${err.message}`,
                type: 'functional',
                config: functionalConfig // Armazena a configuração bruta para o relatório
            }, ...prev]);
            return; // Interrompe a execução do teste.
        }

        let parsedBody = undefined;
        if (functionalConfig.body && ['POST', 'PUT', 'PATCH'].includes(functionalConfig.method)) {
            try {
                parsedBody = JSON.parse(functionalConfig.body);
            } catch (err) {
                setIsLoading(false);
                // Adiciona um resultado de falha imediato se o JSON do body for inválido.
                setResults(prev => [{
                    id: testCounter.current,
                    name: functionalConfig.name || `Teste Funcional #${testCounter.current}`,
                    timestamp: new Date().toLocaleString('pt-BR'),
                    status: 'failed',
                    message: `Erro ao processar body JSON: ${err.message}`,
                    type: 'functional',
                    config: functionalConfig
                }, ...prev]);
                return; // Interrompe a execução do teste.
            }
        }

        let expectedStatus;
        try {
            const jsonParsed = JSON.parse(functionalConfig.expectedStatus);
            if (Array.isArray(jsonParsed) || typeof jsonParsed === 'number') {
                expectedStatus = jsonParsed;
            } else {
                expectedStatus = parseInt(functionalConfig.expectedStatus, 10);
            }
        } catch {
            expectedStatus = parseInt(functionalConfig.expectedStatus, 10);
        }
        // Garante que 'expectedStatus' seja um número ou array válido, com fallback para 200.
        if (isNaN(expectedStatus) && typeof expectedStatus !== 'object') {
            expectedStatus = 200;
        }

        const currentTestConfig = { // Snapshot da configuração processada para esta execução
            ...functionalConfig,
            headers: parsedHeaders,
            body: parsedBody,
            expectedStatus: expectedStatus
        };

        let testResult = {
            id: testCounter.current,
            name: currentTestConfig.name || `Teste Funcional #${testCounter.current}`,
            timestamp: new Date().toLocaleString('pt-BR'),
            status: 'running',
            type: 'functional', // Define o tipo de teste como 'functional'.
            config: currentTestConfig, // Armazena a configuração processada para o relatório.
        };

        // Adiciona o resultado inicial à lista de resultados para feedback imediato na UI.
        setResults(prev => [testResult, ...prev]);

        try {
            const responseData = await executeSingleRequest(currentTestConfig); // Usa a config processada

            if (responseData.error) {
                throw new Error(responseData.error); // Lança erro se houver problema na requisição.
            }

            testResult.response = responseData; // Armazena os dados da resposta.

            // Verifica se o status da resposta está entre os status esperados.
            const expectedStatuses = Array.isArray(currentTestConfig.expectedStatus) ? currentTestConfig.expectedStatus : [currentTestConfig.expectedStatus];
            const statusPassed = expectedStatuses.includes(responseData.status);

            // Executa validações adicionais (Content-Type, tempo de resposta, estrutura JSON).
            const validations = memoizedRunValidations(testResult.response, currentTestConfig);
            const validationsPassed = validations.every(v => v.passed); // Verifica se todas as validações passaram.

            // Determina o resultado final do teste (passou/falhou) e a mensagem.
            if (statusPassed && validationsPassed) {
                testResult.status = 'passed';
                testResult.message = `Teste funcional passou com status ${responseData.status}.`;
            } else {
                testResult.status = 'failed';
                testResult.message = !statusPassed ? `Falhou: Status esperado ${expectedStatuses.join(' ou ')}, recebido ${responseData.status}.` : 'Falhou: Uma ou mais validações adicionais não passaram.';
            }
            testResult.validations = validations; // Armazena as validações detalhadas.

        } catch (error) {
            // Captura erros críticos durante o processo do teste.
            testResult.status = 'failed';
            testResult.message = `Erro crítico: ${error.message}`;
            testResult.error = error.message;
        } finally {
            setIsLoading(false); // Finaliza o estado de carregamento.
            // Atualiza o resultado final na lista, substituindo o estado 'running'.
            setResults(prev => prev.map(res => res.id === testResult.id ? testResult : res));
        }
    }, [functionalConfig, executeSingleRequest, memoizedRunValidations]); // Dependências do useCallback.

    // Nova função para executar um teste de performance (usa performanceConfig do estado)
    const runPerformanceTest = useCallback(async () => {
        setIsLoading(true); // Define o estado de carregamento.
        testCounter.current += 1; // Incrementa o contador de testes.

        // --- Validação e parsing dos inputs do performanceConfig ---
        let parsedHeaders = {};
        try {
            parsedHeaders = performanceConfig.headers ? JSON.parse(performanceConfig.headers) : {};
        } catch (err) {
            setIsLoading(false);
            setResults(prev => [{
                id: testCounter.current,
                name: performanceConfig.name || `Teste de Performance #${testCounter.current}`,
                timestamp: new Date().toLocaleString('pt-BR'),
                status: 'failed',
                message: `Erro ao processar headers JSON: ${err.message}`,
                type: 'performance',
                config: performanceConfig
            }, ...prev]);
            return;
        }

        let parsedBody = undefined;
        if (performanceConfig.body && ['POST', 'PUT', 'PATCH'].includes(performanceConfig.method)) {
            try {
                parsedBody = JSON.parse(performanceConfig.body);
            } catch (err) {
                setIsLoading(false);
                setResults(prev => [{
                    id: testCounter.current,
                    name: performanceConfig.name || `Teste de Performance #${testCounter.current}`,
                    timestamp: new Date().toLocaleString('pt-BR'),
                    status: 'failed',
                    message: `Erro ao processar body JSON: ${err.message}`,
                    type: 'performance',
                    config: performanceConfig
                }, ...prev]);
                return;
            }
        }

        let expectedStatus;
        try {
            const jsonParsed = JSON.parse(performanceConfig.expectedStatus);
            if (Array.isArray(jsonParsed) || typeof jsonParsed === 'number') {
                expectedStatus = jsonParsed;
            } else {
                expectedStatus = parseInt(performanceConfig.expectedStatus, 10);
            }
        } catch {
            expectedStatus = parseInt(performanceConfig.expectedStatus, 10);
        }
        if (isNaN(expectedStatus) && typeof expectedStatus !== 'object') {
            expectedStatus = 200;
        }

        const parsedMaxResponseTime = parseInt(performanceConfig.maxResponseTime, 10);
        const parsedNumberOfRequests = parseInt(performanceConfig.numberOfRequests, 10);
        const parsedConcurrency = parseInt(performanceConfig.concurrency, 10);

        const currentTestConfig = { // Snapshot da configuração processada para esta execução
            ...performanceConfig,
            headers: parsedHeaders,
            body: parsedBody,
            expectedStatus: expectedStatus,
            maxResponseTime: isNaN(parsedMaxResponseTime) ? null : parsedMaxResponseTime,
            numberOfRequests: isNaN(parsedNumberOfRequests) ? 10 : parsedNumberOfRequests,
            concurrency: isNaN(parsedConcurrency) ? 5 : parsedConcurrency,
        };

        let performanceTestResult = {
            id: testCounter.current,
            name: currentTestConfig.name || `Teste de Performance #${testCounter.current}`,
            timestamp: new Date().toLocaleString('pt-BR'),
            type: 'performance', // Identificador de tipo de teste
            status: 'running',
            config: currentTestConfig, // Armazena a config processada para o relatório
            metrics: {}, // Métricas de performance
            individualResults: [] // Opcional: resultados de cada requisição
        };

        setResults(prev => [performanceTestResult, ...prev]); // Adiciona o resultado inicial "running"

        try {
            const startTime = performance.now(); // Inicia a contagem do tempo total do teste de performance.

            // Função auxiliar para controlar a concorrência (simplificada, pode ser movida para utils)
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

            const limit = pLimit(currentTestConfig.concurrency); // Cria uma função de limite de concorrência.
            const allDurations = []; // Armazena a duração de cada requisição individual.
            let successfulRequests = 0;
            let failedRequests = 0;
            let anyIndividualRequestFailed = false; // NOVO: Flag para verificar se alguma requisição individual falhou

            // Cria um array de Promises, cada uma representando uma requisição limitada pela concorrência.
            const requests = Array.from({ length: currentTestConfig.numberOfRequests }, (_, i) =>
                limit(() => executeSingleRequest(currentTestConfig).then(response => {
                    performanceTestResult.individualResults.push(response); // Coleta resultados individuais
                    allDurations.push(response.duration);

                    // Verifica se a requisição individual passou (status HTTP + validações internas, incluindo tempo)
                    if (response.passed) { // Usa a nova propriedade 'passed' do executeSingleRequest
                        successfulRequests++;
                    } else {
                        failedRequests++;
                        anyIndividualRequestFailed = true; // Marca que uma requisição individual falhou
                    }
                    return response; // Retorna a resposta para Promise.allSettled
                }))
            );

            await Promise.allSettled(requests); // Espera que todas as Promises sejam resolvidas ou rejeitadas

            const endTime = performance.now(); // Finaliza a contagem do tempo total.
            const totalDuration = parseFloat((endTime - startTime).toFixed(2)); // Duração total do teste.

            // Calcula as métricas de performance agregadas.
            const averageResponseTime = allDurations.length > 0
                ? parseFloat((allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length).toFixed(2))
                : 0;
            const errorRate = currentTestConfig.numberOfRequests > 0
                ? parseFloat(((failedRequests / currentTestConfig.numberOfRequests) * 100).toFixed(2))
                : 0;
            const throughput = totalDuration > 0
                ? parseFloat(((currentTestConfig.numberOfRequests / (totalDuration / 1000))).toFixed(2)) // Requisições por segundo.
                : 0;

            // Determina o status geral do teste de performance.
            // O teste falha se houver qualquer requisição individual falha (por status, erro de rede, ou tempo excedido).
            if (anyIndividualRequestFailed) { // Usa a nova flag
                performanceTestResult.status = 'failed';
                performanceTestResult.message = `Teste de performance falhou: ${failedRequests} de ${currentTestConfig.numberOfRequests} requisições falharam (incluindo tempo máximo excedido).`;
            } else {
                performanceTestResult.status = 'passed';
                performanceTestResult.message = `Teste de performance concluído. Total: ${currentTestConfig.numberOfRequests}, Sucesso: ${successfulRequests}, Falha: ${failedRequests}.`;
            }

            performanceTestResult.metrics = {
                averageResponseTime,
                errorRate,
                throughput,
                totalDuration,
                successfulRequests,
                failedRequests
            };

        } catch (error) {
            // Captura erros críticos durante o processo do teste de performance.
            performanceTestResult.status = 'failed';
            performanceTestResult.message = `Erro crítico no teste de performance: ${error.message}`;
            performanceTestResult.error = error.message;
        } finally {
            setIsLoading(false); // Finaliza o estado de carregamento.
            // Atualiza o resultado final na lista, substituindo o estado 'running'.
            setResults(prev => prev.map(res => res.id === performanceTestResult.id ? performanceTestResult : res));
        }
    }, [performanceConfig, executeSingleRequest]); // Dependências do useCallback.

    // Função para limpar todos os resultados e resetar as configurações dos formulários para o estado inicial.
    // Esta função é chamada explicitamente pelo botão "Limpar" ou ao trocar de abas.
    const clearResults = useCallback(() => {
        setResults([]); // Limpa os resultados.
        testCounter.current = 0; // Reseta o contador de testes.
        // Reseta as configurações de ambos os formulários para seus valores padrão.
        setFunctionalConfig({
            url: 'https://example.com/',
            method: 'GET',
            headers: '{"Content-Type": "application/json"}',
            body: '',
            expectedStatus: '200',
            name: 'Meu Teste Funcional',
        });
        setPerformanceConfig({
            url: 'https://example.com/',
            method: 'GET',
            headers: '{"Content-Type": "application/json"}',
            body: '',
            expectedStatus: '200',
            maxResponseTime: '2000',
            numberOfRequests: '10',
            concurrency: '5',
            name: 'Meu Teste de Performance',
        });
    }, []);

    // Cálculo do sumário dos resultados (total, passou, falhou).
    // Memoizado com useMemo para recalcular apenas quando 'results' muda.
    const summary = useMemo(() => {
        return results.reduce((acc, r) => {
            acc.total += 1;
            if (r.status === 'passed') acc.passed += 1;
            else acc.failed += 1;
            return acc;
        }, { total: 0, passed: 0, failed: 0 });
    }, [results]);

    // Função para gerar relatório JSON, agora com capacidade de filtrar por tipo de teste.
    const getJsonReport = useCallback((filterType = 'all') => {
        if (results.length === 0) return null;

        // Filtra os resultados com base no 'filterType' fornecido.
        const filteredResults = results.filter(result => {
            if (filterType === 'all') return true; // Se 'all', inclui todos.
            return result.type === filterType; // Filtra por tipo específico.
        });

        if (filteredResults.length === 0) return null; // Retorna null se não houver resultados após o filtro.

        // Recalcula o sumário para os resultados filtrados, garantindo precisão no relatório.
        const filteredSummary = filteredResults.reduce((acc, r) => {
            acc.total += 1;
            if (r.status === 'passed') acc.passed += 1;
            else acc.failed += 1;
            return acc;
        }, { total: 0, passed: 0, failed: 0 });

        // Objeto do relatório JSON.
        const report = {
            summary: filteredSummary,
            results: filteredResults,
            timestamp: new Date().toISOString(),
        };
        return JSON.stringify(report, null, 2); // Retorna o JSON formatado.
    }, [results]); // Dependência de 'results'.

    // Retorna os estados e funções que o hook expõe para os componentes.
    return {
        results,
        summary,
        isLoading,
        runTest,
        runPerformanceTest,
        clearResults,
        getJsonReport,
        functionalConfig, // Expõe as configurações para os componentes de formulário.
        setFunctionalConfig,
        performanceConfig,
        setPerformanceConfig
    };
};
