import React, { useEffect, useState } from 'react';
import styles from '../styles/MainScreen.module.css';

interface MainScreenProps {
    onReload:any;
  onNavigate: (screen: 'upload' | 'capture') => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onNavigate }) => {


  return (
    <div className={styles.mainScreen}>
      <h1>Aadhar Card Verifier</h1>
      <button onClick={() => onNavigate('upload')}>Upload Image</button>
      <button onClick={() => onNavigate('capture')}>Capture Image</button>
    </div>
  );
};

export default MainScreen;
