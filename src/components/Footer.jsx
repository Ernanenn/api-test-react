import React from 'react';

// Componente de rodapé da aplicação
const Footer = () => {
    const currentYear = new Date().getFullYear(); // Obtém o ano atual dinamicamente

    return (
        <footer className="footer">
            <div className="footer-content">
                <p>Desenvolvido por Ernane Nogueira Nunes</p>
                <div className="social-links">
                    <a href="https://www.linkedin.com/in/ernane-nogueira-nunes-822143112/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn de Ernane Nogueira Nunes">
                        LinkedIn
                    </a>
                    <a href="https://github.com/Ernanenn"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub de Ernane Nogueira Nunes">
                        GitHub
                    </a>
                    <a href="mailto:ernanenn@gmail.com"
                        aria-label="Email de Ernane Nogueira Nunes">
                        Email
                    </a>
                </div>
                <p>&copy; {currentYear} Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
