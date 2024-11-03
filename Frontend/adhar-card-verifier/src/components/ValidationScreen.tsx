import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import styles from '../styles/ValidationScreen.module.css';

interface ValidationScreenProps {
  image: string | null; // Assume this is the base64 string or URL
  onBack: () => void;
}

const ValidationScreen: React.FC<ValidationScreenProps> = ({ image, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    aadharNumber: '',
    name: '',
    gender: '',
    dob: '',
  });

  useEffect(() => {
    handleExtractData();
  }, [image]);

  const handleExtractData = async () => {
    try {
      const byteString = atob(image!.split(',')[1]);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
  
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
  
      const response = await axios.post('http://localhost:5000/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const { detections } = response.data;
  
      detections.forEach((detection: { class_name: string; extracted_text: string }) => {
        if (detection.class_name === 'AADHAR_NUMBER') {
          setFormData(prev => ({ ...prev, aadharNumber: detection.extracted_text }));
        } else if (detection.class_name === 'NAME') {
          setFormData(prev => ({ ...prev, name: detection.extracted_text }));
        } else if (detection.class_name === 'GENDER') {
          setFormData(prev => ({ ...prev, gender: detection.extracted_text }));
        } else if (detection.class_name === 'DATE_OF_BIRTH') {
          setFormData(prev => ({ ...prev, dob: detection.extracted_text }));
        }
      });
  
      setLoading(false);
  
    } catch (error) {
      console.error("Error extracting data:", error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitHandler = async () => {
    try {
      const response = await axios.post('http://localhost:5000/submit', {
        aadharNumber: formData.aadharNumber,
        name: formData.name,
        gender: formData.gender,
        dob: formData.dob,
      });

      console.log(response.data.message);
      window.alert('Submitted successfully!');
      onBack(); // Redirect to main screen
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div className={styles.validationScreen}>
      <button onClick={onBack}>Back</button>
      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loader}>Extracting data...</div>
        ) : (
          <>
            <div className={styles.imageContainer}>
              <img src={image!} alt="Aadhar card" className={styles.image} />
            </div>
            <form className={styles.form}>
              <h2>Extracted Details</h2>
              <div className={styles.formGroup}>
                <label>Aadhar No:</label>
                <input
                  type="text"
                  name="aadharNumber" // Specify the name attribute
                  value={formData.aadharNumber}
                  onChange={handleChange} // Add onChange handler
                />
              </div>
              <div className={styles.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  name="name" // Specify the name attribute
                  value={formData.name}
                  onChange={handleChange} // Add onChange handler
                />
              </div>
              <div className={styles.formGroup}>
                <label>Gender:</label>
                <input
                  type="text"
                  name="gender" // Specify the name attribute
                  value={formData.gender}
                  onChange={handleChange} // Add onChange handler
                />
              </div>
              <div className={styles.formGroup}>
                <label>DOB:</label>
                <input
                  type="text"
                  name="dob" // Specify the name attribute
                  value={formData.dob}
                  onChange={handleChange} // Add onChange handler
                />
              </div>
              <button type="button" onClick={submitHandler}>Submit</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ValidationScreen;
