import React from 'react';

// Componentes de ícones SVG utilizados na aplicação
// Ícone de Play (usado no botão de executar teste)
export const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
// Ícone de Limpar (usado no botão de limpar resultados)
export const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
// Ícone de PDF (usado no botão de exportar para PDF)
export const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M11.5 20h-1a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2h1v6z"></path><path d="M18 14h-1.5a1.5 1.5 0 0 0 0 3h1.5v-3z"></path><path d="M14 14v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z"></path></svg>;
// Ícone de JSON (usado no botão de exportar para JSON)
export const JsonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.5v-11A2.5 2.5 0 0017.5 3h-11A2.5 2.5 0 004 5.5v11A2.5 2.5 0 006.5 21h11A2.5 2.5 0 0020 18.5z"></path><path d="M16 8h-1.2a1.8 1.8 0 00-1.8 1.8v.4a1.8 1.8 0 001.8 1.8h1.2"></path><path d="M12 8h-1.2a1.8 1.8 0 00-1.8 1.8v.4a1.8 1.8 0 001.8 1.8h1.2"></path></svg>;
// Ícone de Check (usado para indicar testes bem-sucedidos)
export const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
// Ícone de X (usado para indicar testes com falha)
export const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
