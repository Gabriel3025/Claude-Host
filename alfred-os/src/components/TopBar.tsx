import React, { useState } from 'react';

interface TopBarProps {
  activeView: string;
}

export const TopBar: React.FC<TopBarProps> = ({ activeView }) => {
  const [mode, setMode] = useState('operacao');
  const [activeTab, setActiveTab] = useState('radial');

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">ALFRED</div>

        <div className="topbar-mode">
          <button
            className={`topbar-mode-btn ${mode === 'organizacao' ? 'active' : ''}`}
            onClick={() => setMode('organizacao')}
          >
            Organização
          </button>
          <button
            className={`topbar-mode-btn ${mode === 'operacao' ? 'active' : ''}`}
            onClick={() => setMode('operacao')}
          >
            Operação
          </button>
        </div>
      </div>

      <div className="topbar-center">
        <button
          className={`topbar-tab ${activeTab === 'radial' ? 'active' : ''}`}
          onClick={() => setActiveTab('radial')}
        >
          Radial
        </button>
        <button
          className={`topbar-tab ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          Diretório
        </button>
        <button
          className={`topbar-tab ${activeTab === 'operational' ? 'active' : ''}`}
          onClick={() => setActiveTab('operational')}
        >
          Campo Operacional
        </button>
      </div>

      <div className="topbar-right">
        <div className="topbar-indicator">
          <span className="status-dot"></span>
          <span>Alfred Online</span>
        </div>
        <button className="topbar-menu-btn">•••</button>
      </div>
    </div>
  );
};
