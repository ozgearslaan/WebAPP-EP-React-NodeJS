// BayiDetaylariTablo.js

import React from 'react';

const BayiDetaylariTablo = ({ bayiDetails, onClose }) => {

  const filteredDetails = Object.entries(bayiDetails)
    .filter(([key]) => key !== 'BAYI_KODU')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});


  const rows = Object.entries(filteredDetails).map(([key, value]) => {
    return (
      <tr key={key}>
        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2', fontSize: '10px' }}>{key}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '10px' }}>{value}</td>
      </tr>
    );
  });

  return (
    <div className="tablo-penceresi modal" style={{  position: 'fix',
    top: '45%',  
    left: '70.3%', 
    transform: 'translate(-50%, -50%)', 
    zIndex: 1001 }}>
      <div className="table-icerik">
        <span className="table-kapat" onClick={() => onClose()}>
          &times;
        </span>
        <p style={{ color: 'black' }}></p>
        {filteredDetails && Object.keys(filteredDetails).length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2', fontSize: '15px' }}>Alan Adı</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2', fontSize: '15px' }}>SATILAN ÜRÜN MİKTARI</th>
              </tr>
            </thead>
            <tbody>
			
              {rows}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BayiDetaylariTablo;
