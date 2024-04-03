import React from 'react';

const Footer = () => {
    return (
        <footer className="text-center text-lg-start bg-light text-muted" style={{ backgroundColor: '#6c757d' }}>
            <div className="text-center p-3  fw-bold footer-text" style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }}>
                Powered by
                <a className="fw-bold ps-1 text-primary" href="https://finnhub.io" target="_blank" rel="noopener noreferrer">Finnhub.io</a>
            </div>
        </footer>
    );
};

export default Footer;
