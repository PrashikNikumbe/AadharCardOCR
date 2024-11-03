import React, { useState } from 'react';
import MainScreen from './components/MainScreen';
import UploadScreen from './components/UploadScreen';
import CaptureScreen from './components/CaptureScreen';
import ValidationScreen from './components/ValidationScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'main' | 'upload' | 'capture' | 'validation'>('main');
  const [image, setImage] = useState<string | null>(null);

  const handleValidate = (capturedImage: string | null) => {
    setImage(capturedImage);
    setScreen('validation');
  };

  const handleReload = () => {
    // You can add any logic needed to reset state or perform actions
    window.location.reload(); // This will refresh the entire page
  };

  return (
    <div>
      {screen === 'main' && <MainScreen key="main" onNavigate={setScreen} onReload={handleReload} />} {/* Use key to force reload */}
      {screen === 'upload' && (
        <UploadScreen 
          onBack={() => setScreen('main')} 
          onValidate={handleValidate} 
        />
      )}
      {screen === 'capture' && (
        <CaptureScreen 
          onBack={() => setScreen('main')} 
          onValidate={handleValidate} 
        />
      )}
      {screen === 'validation' && (
        <ValidationScreen 
          image={image} 
          onBack={() => setScreen('main')} 
        />
      )}
    </div>
  );
};

export default App;
