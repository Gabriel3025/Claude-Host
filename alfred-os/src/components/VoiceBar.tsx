import React, { useState } from 'react';

export const VoiceBar: React.FC = () => {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="voicebar">
      <div className="voicebar-icon">🎤</div>

      <div className="voicebar-text">
        <div className="voicebar-status">
          {isListening ? 'Escutando...' : 'Iniciando escuta automática'}
        </div>
        <div className="voicebar-message">
          {isListening ? 'Pode falar, senhor...' : 'Diga Alfred para me ativar'}
        </div>
      </div>

      <button
        className="voicebar-button"
        onClick={() => setIsListening(!isListening)}
      >
        {isListening ? 'Pausar' : 'Mãos livres'}
      </button>
    </div>
  );
};
