// app/login/page.tsx (или где вам нужно отобразить QR-код)

import React from 'react';
import QrCodeComponent from '../components/QrCodeComponent'; // Путь до вашего компонента QR-кода

const LoginPage = () => {
  const loginPageUrl = 'http://26.227.151.57:8080/login'; // Ссылка на страницу логина, которая будет зашифрована в QR-коде

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="qr-code-container mt-5 text-center">
        <h3 className="text-sm text-gray-400">Сканируйте QR-код для перехода на страницу:</h3>
        <QrCodeComponent url={loginPageUrl} /> {/* Вставляем компонент с URL */}
      </div>
    </div>
  );
};

export default LoginPage;
