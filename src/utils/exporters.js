/**
 * Exporta um elemento DOM para um arquivo PDF, lidando com conteúdo de múltiplas páginas.
 * @param {HTMLElement} element O elemento a ser exportado.
 */
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Função para exportar resultados para PDF
export const exportToPdf = async (element) => {
    // Verifica se há conteúdo para exportar
    if (!element || !element.children.length || element.querySelector('.text-muted')) {
        alert('Não há resultados para exportar.');
        return;
    }
    
    try {
        // Converte o elemento DOM para canvas
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#2c3e50' }); // Fundo escuro moderno, baseado no CSS
        const imgData = canvas.toDataURL('image/png');
        
        // Inicializa o documento PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        
        // Calcula as dimensões para manter a proporção
        const ratio = imgWidth / pdfWidth;
        const canvasHeight = imgHeight / ratio;

        let heightLeft = canvasHeight;
        let position = 0;

        // Adiciona a primeira página
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeight);
        heightLeft -= pdfHeight;

        // Adiciona novas páginas enquanto houver conteúdo
        while (heightLeft > 0) {
            position = position - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeight);
            heightLeft -= pdfHeight;
        }
        
        // Salva o arquivo PDF
        pdf.save('relatorio_testes_api.pdf');

    } catch (error) {
        console.error("Erro ao exportar para PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF.");
    }
};

/**
 * Cria e baixa um arquivo .json com os dados fornecidos.
 * @param {string} jsonData - A string de dados JSON para exportar.
 */
// Função para exportar resultados para JSON
export const exportToJson = (jsonData) => {
    // Cria um blob com os dados JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Cria um link para download e simula o clique
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio_testes_api.json';
    document.body.appendChild(link);
    link.click();
    
    // Limpa os recursos após o download
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};