import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Checkbox,
  List,
  ActivityIndicator,
  Surface,
  Switch,
  Chip
} from 'react-native-paper';
import { NavigationProps } from '../types/navigation';
import Header from '../components/Header';
import { getProducts, getAllUsers, createCustomList } from '../services/api';
import { Product, User } from '../types';

type CustomListFormScreenProps = {
  navigation: NavigationProps;
};

const CustomListFormScreen = ({ navigation }: CustomListFormScreenProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setDataLoading(true);
      const [productsData, usersData] = await Promise.all([
        getProducts(),
        getAllUsers()
      ]);
      setProducts(productsData);
      // Filtrar apenas usuários não administradores
      const regularUsers = usersData.filter((user: User) => !user.isAdmin);
      setUsers(regularUsers);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Falha ao carregar dados. Por favor, tente novamente.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Por favor, digite um nome para a lista');
      setLoading(false);
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Por favor, selecione pelo menos um produto');
      setLoading(false);
      return;
    }

    try {
      await createCustomList({
        name: name.trim(),
        products: selectedProducts,
        sharedWith: selectedUsers.map(user => user._id),
        description: description.trim(),
        isPublic
      });

      Alert.alert(
        'Sucesso',
        'Lista criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('StockList')
          }
        ]
      );
    } catch (err) {
      console.error('Erro ao criar lista:', err);
      setError('Falha ao criar lista. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (dataLoading) {
    return (
      <View style={styles.container}>
        <Header title="Criar Lista Personalizada" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Criar Lista Personalizada" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Informações da Lista</Text>
            
            <TextInput
              label="Nome da Lista"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <View style={styles.switchContainer}>
              <Text variant="bodyLarge">Tornar lista pública</Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Produtos</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Selecione os produtos para incluir na lista
            </Text>
            
            {selectedProducts.length > 0 && (
              <View style={styles.selectedContainer}>
                <Text variant="bodyMedium" style={styles.selectedCount}>
                  {selectedProducts.length} produto{selectedProducts.length !== 1 ? 's' : ''} selecionado{selectedProducts.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <Surface style={styles.selectionContainer}>
              <ScrollView style={styles.productsList}>
                {products.map((product) => (
                  <Surface key={product._id} style={styles.selectionItem}>
                    <List.Item
                      title={product.name}
                      description={`${product.description} - ${formatPrice(product.price)}`}
                      left={props => (
                        <Checkbox
                          status={selectedProducts.includes(product._id) ? 'checked' : 'unchecked'}
                          onPress={() => {
                            setSelectedProducts(prev =>
                              prev.includes(product._id)
                                ? prev.filter(id => id !== product._id)
                                : [...prev, product._id]
                            );
                          }}
                        />
                      )}
                      style={[
                        styles.listItem,
                        selectedProducts.includes(product._id) && styles.selectedItem
                      ]}
                    />
                  </Surface>
                ))}
              </ScrollView>
            </Surface>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Compartilhar com Usuários</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Selecione os usuários para compartilhar a lista (opcional)
            </Text>

            {selectedUsers.length > 0 && (
              <View style={styles.selectedContainer}>
                <Text variant="bodyMedium" style={styles.selectedCount}>
                  {selectedUsers.length} usuário{selectedUsers.length !== 1 ? 's' : ''} selecionado{selectedUsers.length !== 1 ? 's' : ''}
                </Text>
                <View style={styles.chipContainer}>
                  {selectedUsers.map((user) => (
                    <Chip
                      key={user._id}
                      onClose={() => {
                        setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
                      }}
                      style={styles.chip}
                    >
                      {user.email}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            <Surface style={styles.selectionContainer}>
              <ScrollView style={styles.usersList}>
                {users.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum usuário disponível</Text>
                ) : (
                  users.map((user) => (
                    <Surface key={user._id} style={styles.selectionItem}>
                      <List.Item
                        title={user.email}
                        left={props => (
                          <Checkbox
                            status={selectedUsers.some(u => u._id === user._id) ? 'checked' : 'unchecked'}
                            onPress={() => {
                              setSelectedUsers(prev =>
                                prev.some(u => u._id === user._id)
                                  ? prev.filter(u => u._id !== user._id)
                                  : [...prev, user]
                              );
                            }}
                          />
                        )}
                        style={[
                          styles.listItem,
                          selectedUsers.some(u => u._id === user._id) && styles.selectedItem
                        ]}
                      />
                    </Surface>
                  ))
                )}
              </ScrollView>
            </Surface>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, styles.submitButton]}
            disabled={!name.trim() || selectedProducts.length === 0 || loading}
            loading={loading}
          >
            {loading ? 'Criando...' : 'Criar Lista'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#383A29',
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderRadius: 8,
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#383A29',
  },
  subtitle: {
    marginBottom: 12,
    opacity: 0.7,
    fontSize: 14,
    color: '#666',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  selectedContainer: {
    marginBottom: 12,
  },
  selectedCount: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#383A29',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#383A29',
  },
  selectionContainer: {
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  selectionItem: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: 'white',
  },
  listItem: {
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: 'rgba(56, 58, 41, 0.1)',
  },
  productsList: {
    maxHeight: 300,
  },
  usersList: {
    maxHeight: 200,
  },
  emptyText: {
    textAlign: 'center',
    margin: 16,
    opacity: 0.7,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
  },
  cancelButton: {
    marginRight: 6,
    backgroundColor: '#383A29',
    borderColor: '#383A29',
    borderWidth: 1,
  },
  submitButton: {
    marginLeft: 6,
    backgroundColor: '#383A29',
  },
});

export default CustomListFormScreen;