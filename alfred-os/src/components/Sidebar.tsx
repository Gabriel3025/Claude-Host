import React from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const SIDEBAR_ITEMS = [
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Resultados de operações e projetos',
  },
  {
    id: 'agents',
    title: 'Agentes',
    subtitle: 'Acesso às categorias de agentes',
  },
  {
    id: 'personal',
    title: 'Pessoal',
    subtitle: 'Vida pessoal e rotina',
  },
  {
    id: 'second-brain',
    title: 'Segundo Brain',
    subtitle: 'Novas opções do Alfred',
  },
  {
    id: 'integrations',
    title: 'Integrações',
    subtitle: 'Conexões com outras plataformas',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">OPERAÇÕES</div>
      {SIDEBAR_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
          onClick={() => onViewChange(item.id)}
        >
          <div className="sidebar-item-title">{item.title}</div>
          <div className="sidebar-item-subtitle">{item.subtitle}</div>
        </div>
      ))}
    </div>
  );
};
