import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/CaptureScreen.module.css';

interface CaptureScreenProps {
  onBack: () => void;
  onValidate: (image: string | null) => void; // Prop for navigation
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({ onBack, onValidate }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      console.error('Error accessing camera', err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current!.srcObject = null;
    }
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        context.drawImage(
          video,
          video.videoWidth / 4,
          video.videoHeight / 4,
          video.videoWidth / 2,
          video.videoHeight / 2,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        setCapturedImage(canvasRef.current.toDataURL('image/png'));
        stopCamera(); // Stop camera after capture
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera(); // Stop camera when component unmounts or goes back
    };
  }, []);

  const handleSubmit = () => {
    console.log('Submitting for validation:', capturedImage); // Debugging line
    onValidate(capturedImage); // Call the handler to navigate to ValidationScreen
  };

  return (
    <div className={styles.captureScreen}>
      <button onClick={onBack}>Back</button>
      {!capturedImage ? (
        <>
          <h2>Place your Aadhar card in the box and click Capture</h2>
          <div className={styles.cameraContainer}>
            <video ref={videoRef} className={styles.videoFeed}></video>
            <div className={styles.overlayBox}>Place card here</div>
          </div>
          <button onClick={captureImage}>Capture</button>
          <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
        </>
      ) : (
        <>
          <img src={capturedImage} alt="Captured Aadhar Card" className={styles.previewImage} />
          <button onClick={handleSubmit}>Submit for Validation</button>
          <button onClick={() => { setCapturedImage(null); startCamera(); }}>Retake</button>
        </>
      )}
    </div>
  );
};

export default CaptureScreen;
