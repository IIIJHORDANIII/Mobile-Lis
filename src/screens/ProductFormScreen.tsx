import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Header from '../components/Header';
import { api } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

type ProductFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductForm'>;

export default function ProductFormScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<ProductFormScreenNavigationProp>();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !quantity || !category) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('quantity', quantity);
      formData.append('category', category);
      if (image) {
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'product.jpg',
        } as any);
      }

      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigation.goBack();
    } catch (error: any) {
      console.error('Product creation error:', error);
      setError(error.response?.data?.message || 'Erro ao cadastrar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header 
        title="Novo Produto" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.contentContainer}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>Cadastro de Produto</Text>
          <Text style={styles.subtitle}>Preencha os dados do novo produto</Text>

          <View style={styles.formContainer}>
            <TextInput
              label="Nome"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Descrição"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Preço"
              value={price}
              onChangeText={setPrice}
              mode="outlined"
              style={styles.input}
              keyboardType="decimal-pad"
            />

            <TextInput
              label="Quantidade"
              value={quantity}
              onChangeText={setQuantity}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Classificação:</Text>
              <View style={styles.categoryButtonsContainer}>
                <Button
                  mode={category === 'masculino' ? 'contained' : 'outlined'}
                  onPress={() => setCategory('masculino')}
                  style={[
                    styles.categoryButton,
                    category === 'masculino' && styles.categoryButtonSelected
                  ]}
                  labelStyle={[
                    styles.categoryButtonLabel,
                    category === 'masculino' && styles.categoryButtonLabelSelected
                  ]}
                  buttonColor="#383A29"
                  textColor={category === 'masculino' ? '#d9d9d9' : '#383A29'}
                >
                  Masculino
                </Button>
                <Button
                  mode={category === 'feminino' ? 'contained' : 'outlined'}
                  onPress={() => setCategory('feminino')}
                  style={[
                    styles.categoryButton,
                    category === 'feminino' && styles.categoryButtonSelected
                  ]}
                  labelStyle={[
                    styles.categoryButtonLabel,
                    category === 'feminino' && styles.categoryButtonLabelSelected
                  ]}
                  buttonColor="#383A29"
                  textColor={category === 'feminino' ? '#d9d9d9' : '#383A29'}
                >
                  Feminino
                </Button>
                <Button
                  mode={category === 'infantil' ? 'contained' : 'outlined'}
                  onPress={() => setCategory('infantil')}
                  style={[
                    styles.categoryButton,
                    category === 'infantil' && styles.categoryButtonSelected
                  ]}
                  labelStyle={[
                    styles.categoryButtonLabel,
                    category === 'infantil' && styles.categoryButtonLabelSelected
                  ]}
                  buttonColor="#383A29"
                  textColor={category === 'infantil' ? '#d9d9d9' : '#383A29'}
                >
                  Infantil
                </Button>
              </View>
            </View>

            <Button
              mode="outlined"
              onPress={pickImage}
              style={styles.imageButton}
            >
              {image ? 'Alterar Imagem' : 'Selecionar Imagem'}
            </Button>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Cadastrar
            </Button>
          </View>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#383A29',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  surface: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#d9d9d9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#383A29',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  imageButton: {
    backgroundColor: 'white',
    borderColor: '#383A29',
    borderWidth: 1,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#383A29',
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 58, 41, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383A29',
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: 'transparent',
    borderColor: '#383A29',
    borderWidth: 2,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    flex: 1,
  },
  categoryButtonSelected: {
    backgroundColor: '#383A29',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  categoryButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#383A29',
    textTransform: 'none',
    padding: 0,
    margin: 0,
  },
  categoryButtonLabelSelected: {
    color: '#d9d9d9',
    padding: 0,
    margin: 0,
    fontSize: 14,
    fontWeight: '600',
  },
});