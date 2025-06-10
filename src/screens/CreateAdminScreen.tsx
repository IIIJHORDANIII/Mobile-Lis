import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Header from '../components/Header';

type CreateAdminScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateAdmin'>;

export default function CreateAdminScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<CreateAdminScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateUser = async () => {
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      navigation.goBack();
    } catch (error) {
      setError('Erro ao criar usuário. Por favor, tente novamente.');
      console.error('Create user error:', error);
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
        title="Novo Usuário" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.contentContainer}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>Criar Novo Usuário</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              label="Nome"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleCreateUser}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Criar Usuário
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#383A29',
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#383A29',
  },
  errorText: {
    color: '#b00020',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});