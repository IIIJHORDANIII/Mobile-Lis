import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Card, Dialog, Portal, TextInput, List, Checkbox, ActivityIndicator, Surface } from 'react-native-paper';
import { NavigationProps } from '../types/navigation';
import { Product } from '../types';
import Header from '../components/Header';
import { api } from '../services/api';

type User = {
  _id: string;
  email: string;
  isAdmin: boolean;
};

type StockList = {
  _id: string;
  name: string;
  products: Product[];
  sharedWith: string[];
};

type StockListScreenProps = {
  navigation: NavigationProps;
};

const StockListScreen = ({ navigation }: StockListScreenProps) => {
  const [lists, setLists] = useState<StockList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const loadLists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/custom-lists');
      setLists(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading lists:', err);
      setError('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [productsResponse, usersResponse] = await Promise.all([
        api.get('/products'),
        api.get('/users')
      ]);
      setProducts(productsResponse.data);
      // Filtrar apenas usuários não administradores
      const regularUsers = usersResponse.data.filter((user: User) => !user.isAdmin);
      setUsers(regularUsers);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    loadLists();
    loadData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadLists().finally(() => setRefreshing(false));
  }, []);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setError('Please enter a list name');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    try {
      await api.post('/custom-lists', {
        name: newListName.trim(),
        products: selectedProducts,
        sharedWith: selectedUsers.map(user => user._id)
      });

      setCreateModalVisible(false);
      setNewListName('');
      setSelectedProducts([]);
      setSelectedUsers([]);
      loadLists();
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create list');
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await api.delete(`/custom-lists/${listId}`);
      loadLists();
    } catch (err) {
      console.error('Error deleting list:', err);
      setError('Failed to delete list');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Listas de Estoque" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Listas de Estoque" showBackButton onBackPress={() => navigation.navigate('Home')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : lists.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma lista encontrada</Text>
        ) : (
          lists.map((list) => (
            <Card key={list._id} style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">{list.name}</Text>
                <Text variant="bodyMedium">
                  {list.products.length} produtos
                </Text>
                {list.sharedWith.length > 0 && (
                  <Text variant="bodySmall">
                    Compartilhado com {list.sharedWith.length} usuários
                  </Text>
                )}
              </Card.Content>
              <Card.Actions>
                <Button
                  onPress={() => navigation.navigate('CustomListDisplay', { listId: list._id })}
                  buttonColor="#383A29"
                  textColor="#d9d9d9"
                >
                  Ver Produtos
                </Button>
                <Button
                  onPress={() => handleDeleteList(list._id)}
                  buttonColor="#383A29"
                  textColor="#d9d9d9"
                >
                  Excluir
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={createModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          style={styles.modal}
        >
          <Dialog.Title>Criar Nova Lista</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome da Lista"
              value={newListName}
              onChangeText={setNewListName}
              style={styles.input}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Produtos
            </Text>
            <Surface style={styles.selectionContainer}>
              <ScrollView style={styles.productsList}>
                {products.map((product) => (
                  <Surface key={product._id} style={styles.selectionItem}>
                    <List.Item
                      title={product.name}
                      description={formatPrice(product.price)}
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
              <Text style={styles.selectionCount}>
                {selectedProducts.length} produto{selectedProducts.length !== 1 ? 's' : ''} selecionado{selectedProducts.length !== 1 ? 's' : ''}
              </Text>
            </Surface>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Compartilhar com Usuários
            </Text>
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
              <Text style={styles.selectionCount}>
                {selectedUsers.length} usuário{selectedUsers.length !== 1 ? 's' : ''} selecionado{selectedUsers.length !== 1 ? 's' : ''}
              </Text>
            </Surface>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateList}>Criar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Surface style={styles.fabContainer}>
        <Button
          mode="contained"
          onPress={() => setCreateModalVisible(true)}
          style={styles.fab}
          buttonColor="#383a29"
          textColor="#d9d9d9"
        >
          Nova Lista
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
  emptyText: {
    textAlign: 'center',
    margin: 16,
    opacity: 0.7,
  },
  modal: {
    backgroundColor: '#d9d9d9',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  selectionContainer: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  selectionItem: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  listItem: {
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  productsList: {
    maxHeight: 200,
  },
  usersList: {
    maxHeight: 200,
  },
  selectionCount: {
    textAlign: 'center',
    padding: 8,
    color: '#666',
    fontSize: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    left: 16,
    elevation: 4,
    borderRadius: 8,
  },
  fab: {
    margin: 8,
  },
});

export default StockListScreen;