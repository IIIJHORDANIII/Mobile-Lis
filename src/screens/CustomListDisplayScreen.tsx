import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Surface, ActivityIndicator, FAB, Portal, Modal, Button, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import Header from '../components/Header';
import { api, removeProductFromList, addProductToList } from '../services/api';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

type CustomListDisplayRouteProp = RouteProp<RootStackParamList, 'CustomListDisplay'>;

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomList {
  _id: string;
  name: string;
  products: Product[];
  sharedWith: string[];
  createdBy: string;
  createdAt: string;
}

export default function CustomListDisplayScreen() {
  const route = useRoute<CustomListDisplayRouteProp>();
  const navigation = useNavigation();
  const { listId } = route.params;
  const { isAdmin } = useAuth();
  
  const [list, setList] = useState<CustomList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadList();
  }, [listId]);

  const loadList = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/custom-lists/${listId}`);
      setList(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error loading list:', err);
      if (err.response?.status === 404) {
        setError('Lista não encontrada');
      } else if (err.response?.status === 403) {
        setError('Sem permissão para acessar esta lista');
      } else {
        setError('Erro ao carregar lista');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadList().finally(() => setRefreshing(false));
  }, [listId]);

  const loadAvailableProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get('/api/products');
      // Filter out products already in the list
      const filtered = response.data.filter((product: Product) => 
        !list?.products.some(listProduct => listProduct._id === product._id)
      );
      setAvailableProducts(filtered);
    } catch (err) {
      console.error('Error loading products:', err);
      Alert.alert('Erro', 'Erro ao carregar produtos disponíveis');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    Alert.alert(
      'Remover Produto',
      'Tem certeza que deseja remover este produto da lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedList = await removeProductFromList(listId, productId);
              setList(updatedList);
              Alert.alert('Sucesso', 'Produto removido da lista');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao remover produto da lista');
            }
          }
        }
      ]
    );
  };

  const handleAddProduct = async (productId: string) => {
    try {
      const updatedList = await addProductToList(listId, productId);
      setList(updatedList);
      setShowAddModal(false);
      Alert.alert('Sucesso', 'Produto adicionado à lista');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao adicionar produto à lista');
    }
  };

  const openAddModal = () => {
    loadAvailableProducts();
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Lista Personalizada" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando lista...</Text>
        </View>
      </View>
    );
  }

  if (error || !list) {
    return (
      <View style={styles.container}>
        <Header title="Lista Personalizada" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Lista não encontrada'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={list.name} 
        showBackButton={true}
        rightAction={
          isAdmin ? (
            <IconButton
              icon={editMode ? "check" : "pencil"}
              size={24}
              iconColor="#fff"
              onPress={() => setEditMode(!editMode)}
            />
          ) : null
        }
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Surface style={styles.infoCard}>
          <Text style={styles.listTitle}>{list.name}</Text>
          <Text style={styles.productCount}>
            {list.products.length} produto{list.products.length !== 1 ? 's' : ''}
          </Text>
        </Surface>

        {list.products.length === 0 ? (
          <Surface style={styles.emptyCard}>
            <Text style={styles.emptyText}>Esta lista não possui produtos</Text>
          </Surface>
        ) : (
          list.products.map((product) => (
            <Card key={product._id} style={styles.productCard}>
              <Card.Content>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productActions}>
                    <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                    {editMode && isAdmin && (
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor="#d32f2f"
                        onPress={() => handleRemoveProduct(product._id)}
                      />
                    )}
                  </View>
                </View>
                
                <Text style={styles.productDescription}>{product.description}</Text>
                
                <View style={styles.productFooter}>
                  <Text style={styles.quantityText}>Quantidade: {product.quantity}</Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {editMode && isAdmin && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={openAddModal}
        />
      )}

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Adicionar Produto</Text>
          
          {loadingProducts ? (
            <ActivityIndicator size="large" style={styles.modalLoading} />
          ) : (
            <ScrollView style={styles.modalContent}>
              {availableProducts.map((product) => (
                <Card key={product._id} style={styles.modalProductCard}>
                  <Card.Content>
                    <View style={styles.modalProductHeader}>
                      <View style={styles.modalProductInfo}>
                        <Text style={styles.modalProductName}>{product.name}</Text>
                        <Text style={styles.modalProductPrice}>{formatCurrency(product.price)}</Text>
                      </View>
                      <Button
                        mode="contained"
                        onPress={() => handleAddProduct(product._id)}
                        style={styles.addButton}
                      >
                        Adicionar
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          )}
          
          <Button
            mode="outlined"
            onPress={() => setShowAddModal(false)}
            style={styles.modalCloseButton}
          >
            Fechar
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#383A29',
    marginBottom: 8,
  },
  listInfo: {
    fontSize: 14,
    color: '#666',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    margin: 20,
    padding: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383A29',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383A29',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#383A29',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#383A29',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalLoading: {
    margin: 20,
  },
  modalProductCard: {
    marginBottom: 8,
  },
  modalProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalProductInfo: {
    flex: 1,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383A29',
  },
  modalProductPrice: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#383A29',
  },
  modalCloseButton: {
    marginTop: 16,
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 3,
  },
});