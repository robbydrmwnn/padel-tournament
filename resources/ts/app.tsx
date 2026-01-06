import React from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
    return <h1>Hello Laravel + React + TypeScript</h1>;
};

const container = document.getElementById('app');

if (!container) {
    throw new Error('Root container missing in index.html');
}

createRoot(container).render(<App />);
