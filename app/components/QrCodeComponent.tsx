import React from 'react';
import ReactQrCode from 'react-qr-code';

interface QrCodeComponentProps {
  url: string;
}

const QrCodeComponent: React.FC<QrCodeComponentProps> = ({ url }) => {
  return (
    <div className="qr-container" style={{ textAlign: 'center', padding: '20px', border: '2px solid #ccc', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
      <ReactQrCode value={url} size={256} />
      <p style={{ marginTop: '10px', fontSize: '16px', color: '#333' }}>Сканируйте этот код для перехода на страницу</p>
    </div>
  );
};

export default QrCodeComponent;
