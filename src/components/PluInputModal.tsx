import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface PluInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pluCode: string) => void;
}

export const PluInputModal: React.FC<PluInputModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [plu, setPlu] = useState('');

  const handleSubmit = () => {
    if (plu.trim()) {
      onSubmit(plu.trim());
      setPlu('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Введите PLU-код</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={plu}
            onChangeText={setPlu}
            placeholder="Например: 4011"
            placeholderTextColor="#aaa"
            autoFocus
          />
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Найти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#2C2C2E',
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#3A3A3C',
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});