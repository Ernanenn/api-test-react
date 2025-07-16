// Importação das bibliotecas necessárias.
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta um elemento DOM para um arquivo PDF, lidando com conteúdo de múltiplas páginas.
 * Esta função agora recebe os resultados brutos, o tipo de filtro e a referência
 * para um container DOM onde o conteúdo será renderizado temporariamente para a exportação.
 *
 * @param {Array} results Os resultados brutos dos testes.
 * @param {string} filterType O tipo de teste para filtrar ('functional', 'performance', 'all').
 * @param {React.RefObject<HTMLElement>} containerRef A referência para o container DOM oculto.
 */
export const exportToPdf = async (results, filterType, containerRef) => {
    // Verifica se a referência do container e o elemento DOM existem.
    if (!containerRef || !containerRef.current) {
        console.error("Erro: Referência do container de exportação não encontrada ou elemento DOM ausente.");
        // Não usar alert() em produção, mas para depuração pode ser útil.
        // alert("Erro ao gerar PDF: Componente de resultados para exportação não encontrado.");
        return;
    }

    const element = containerRef.current; // O elemento DOM real a ser capturado.

    // Verifica se o elemento contém a mensagem "Nenhum teste executado ainda."
    // Isso é uma verificação para evitar exportar um PDF vazio ou com a mensagem de "nenhum resultado".
    const noResultsMessage = element.querySelector('.text-muted');
    if (noResultsMessage && noResultsMessage.textContent.includes('Nenhum teste executado ainda.')) {
        console.warn('Não há resultados válidos para exportar para PDF.');
        // alert('Não há resultados para exportar para PDF.');
        return;
    }

    // Pequeno atraso para garantir que o React teve tempo de renderizar o conteúdo
    // filtrado no elemento oculto antes de html2canvas tentar capturá-lo.
    // Aumentado para 100ms para maior robustez.
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        // Converte o elemento DOM para um canvas.
        // `scale: 2` para melhor qualidade em telas de alta resolução.
        // `backgroundColor: '#FFFFFF'` garante um fundo branco no PDF.
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#FFFFFF' });
        const imgData = canvas.toDataURL('image/png'); // Converte o canvas para uma imagem PNG base64.

        // Verificação adicional para garantir que imgData não está vazio ou corrompido.
        if (!imgData || imgData.length < 100) { // Um valor arbitrário para verificar se a imagem não é quase vazia
            console.error("Erro: Dados da imagem para PDF são inválidos ou muito pequenos.");
            throw new Error("Não foi possível gerar a imagem para o PDF. Conteúdo vazio ou inválido.");
        }

        // Inicializa o documento PDF no formato retrato A4.
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData); // Obtém propriedades da imagem.

        // Verificação adicional para garantir que as propriedades da imagem são válidas.
        if (!imgProps || typeof imgProps.width === 'undefined' || typeof imgProps.height === 'undefined') {
            console.error("Erro: Não foi possível obter as propriedades de largura/altura da imagem para o PDF.");
            throw new Error("Problema ao processar as dimensões da imagem para o PDF.");
        }

        const pdfWidth = pdf.internal.pageSize.getWidth(); // Largura da página PDF.
        const pdfHeight = pdf.internal.pageSize.getHeight(); // Altura da página PDF.

        // Calcula as dimensões da imagem no PDF para manter a proporção.
        const ratio = imgProps.width / pdfWidth;
        const canvasHeight = imgProps.height / ratio;

        let heightLeft = canvasHeight; // Altura restante da imagem a ser adicionada.
        let position = 0; // Posição Y atual no PDF.

        // Adiciona a primeira página do PDF.
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeight);
        heightLeft -= pdfHeight; // Reduz a altura restante.

        // Adiciona novas páginas enquanto houver conteúdo que não coube na página atual.
        while (heightLeft > 0) {
            position = position - pdfHeight; // Move a posição para o conteúdo da próxima página.
            pdf.addPage(); // Adiciona uma nova página.
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeight); // Adiciona a imagem.
            heightLeft -= pdfHeight; // Reduz a altura restante.
        }

        // Salva o arquivo PDF com um nome dinâmico que inclui o tipo de teste e um timestamp.
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `relatorio_testes_${filterType}_${timestamp}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error("Erro ao exportar para PDF:", error);
        // Lança o erro para que o componente chamador (App.jsx) possa tratá-lo e exibir feedback ao usuário.
        throw new Error("Ocorreu um erro ao gerar o PDF.");
    }
};

/**
 * Cria e baixa um arquivo .json com os dados fornecidos.
 * O nome do arquivo agora inclui um timestamp para evitar sobrescrever.
 * @param {string} jsonData - A string de dados JSON para exportar.
 */
export const exportToJson = (jsonData) => {
    // Verifica se há dados para exportar.
    if (!jsonData) {
        console.warn('Não há dados para exportar para JSON.');
        // alert('Não há dados para exportar para JSON.'); // Opcional, se quiser feedback visual
        return;
    }
    // Cria um Blob (Binary Large Object) com os dados JSON e o tipo MIME.
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob); // Cria uma URL temporária para o Blob.

    // Cria um elemento 'a' (link) no DOM.
    const link = document.createElement('a');
    link.href = url; // Define o href do link para a URL do Blob.

    // Gera um timestamp para o nome do arquivo, evitando caracteres inválidos.
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `relatorio_testes_api_${timestamp}.json`; // Define o nome do arquivo para download.

    // Adiciona o link ao corpo do documento, simula um clique e remove o link.
    document.body.appendChild(link);
    link.click();

    // Libera a URL temporária do Blob para evitar vazamentos de memória.
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};