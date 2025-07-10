import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta um elemento DOM para um arquivo PDF, lidando com conteúdo de múltiplas páginas.
 * Esta função agora renderiza dinamicamente o conteúdo filtrado em um container oculto
 * antes de gerar o PDF, permitindo relatórios individuais por tipo de teste.
 * @param {Array} results Os resultados brutos dos testes (não filtrados aqui, mas o ResultsDisplay oculto os filtrará).
 * @param {string} filterType O tipo de teste para filtrar ('functional', 'performance', 'all').
 * @param {React.RefObject<HTMLElement>} containerRef A referência para o container onde o conteúdo será renderizado temporariamente.
 */
export const exportToPdf = async (results, filterType, containerRef) => {
    // A lógica de verificação de conteúdo (se há resultados para exportar)
    // é agora feita no App.jsx antes de chamar esta função.

    // Garante que a referência ao elemento DOM do container de exportação existe.
    if (!containerRef || !containerRef.current) {
        console.error("Erro: Referência do container de exportação não encontrada.");
        return;
    }

    const element = containerRef.current; // O elemento DOM a ser capturado.

    // Pequeno atraso para garantir que o React teve tempo de renderizar o conteúdo
    // filtrado no elemento oculto antes de html2canvas tentar capturá-lo.
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        // Converte o elemento DOM (com o conteúdo já filtrado e renderizado) para um canvas.
        // backgroundColor: '#FFFFFF' garante um fundo branco no PDF, mesmo que o elemento original tenha fundo transparente ou outro.
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#FFFFFF' });
        const imgData = canvas.toDataURL('image/png'); // Converte o canvas para uma imagem PNG base64.

        // Inicializa o documento PDF no formato retrato A4.
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData); // Obtém propriedades da imagem.
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