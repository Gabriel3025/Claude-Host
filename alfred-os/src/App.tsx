import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { VoiceBar } from './components/VoiceBar';
import { Radial } from './views/Radial';
import './theme.css';

function App() {
  const [activeView, setActiveView] = useState('analytics');

  const renderContent = () => {
    if (activeView === 'analytics') {
      return <Radial />;
    }

    return (
      <div className="canvas-container">
        <div style={{ color: '#7b8aa5', padding: '32px' }}>
          <h2 style={{ color: '#e8eef8', marginBottom: '16px' }}>
            {activeView === 'agents' && 'Agentes'}
            {activeView === 'personal' && 'Pessoal'}
            {activeView === 'second-brain' && 'Segundo Brain'}
            {activeView === 'integrations' && 'Integrações'}
          </h2>
          <p>Conteúdo em desenvolvimento...</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <TopBar activeView={activeView} />
      <main className="main-content">{renderContent()}</main>
      <VoiceBar />
    </>
  );
}

export default App;
