// Lejant.js
import React, { useState, useEffect } from 'react';

const Lejant = ({ directorshipColorMap }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // directorshipColorMap'ta herhangi bir değer varsa Lejant'ı göster
    const hasData = Object.keys(directorshipColorMap).length > 0;
    setIsVisible(hasData);
  }, [directorshipColorMap]);

  const colors = ['#FF69B4', '#8A2BE2', '#FFD700', '#FF6347', '#00CED1'];

  return (
    <div className={`lejant-container ${isVisible ? 'visible' : ''}`}>
      {isVisible && (
        <div className="lejant">
          <h3 className="lejant-title">Lejant</h3>
          <div className="lejant-items">
            {Object.entries(directorshipColorMap).map(([directorship, _], index) => (
              <div key={directorship} className="lejant-item">
                <span className="lejant-color-box" style={{ backgroundColor: colors[index] }}></span>
                <span className="lejant-label">
                  <strong>{directorship}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lejant;