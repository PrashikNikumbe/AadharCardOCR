import React, { useState } from 'react';
import styles from '../styles/UploadScreen.module.css';

interface UploadScreenProps {
  onBack: () => void;
  onValidate: (image: string | null) => void; // New prop for navigation
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onBack, onValidate }) => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onValidate(image); // Call the handler to navigate to ValidationScreen
  };

  return (
    <div className={styles.uploadScreen}>
      <button onClick={onBack}>Back</button>
      <h2>Upload Aadhar Card</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Uploaded Aadhar Card" className={styles.previewImage} />}
      {image && <button onClick={handleSubmit}>Submit for Validation</button>}
    </div>
  );
};

export default UploadScreen;
