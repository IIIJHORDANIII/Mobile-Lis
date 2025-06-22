import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, RefreshControl } from 'react-native';
import { Text, Surface, Card, Button, ActivityIndicator, Portal, Dialog, TextInput } from 'react-native-paper';
import { NavigationProps } from '../types/navigation';
import { useRoute } from '@react-navigation/native';
import Header from '../components/Header';
import { api } from '../services/api';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
};

type ProductListScreenProps = {
  navigation: NavigationProps;
};

const ProductListScreen = ({ navigation }: ProductListScreenProps) => {
  const route = useRoute();
  const { listId } = route.params as { listId?: string };
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (listId) {
        // Carregar produtos de uma lista específica
        response = await api.get(`/custom-lists/${listId}`);
        setProducts(response.data.products || []);
      } else {
        // Carregar todos os produtos (comportamento original)
        response = await api.get('/products');
        setProducts(response.data);
      }
      
      setError('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erro ao carregar produtos. Por favor, tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedProduct) return;

    try {
      const response = await api.put(`/products/${selectedProduct._id}`, {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        quantity: parseInt(editForm.quantity),
      });

      setProducts(products.map(p => 
        p._id === selectedProduct._id ? response.data : p
      ));

      setEditModalVisible(false);
      setSelectedProduct(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erro ao atualizar produto. Por favor, tente novamente.';
      setError(errorMessage);
    }
  };

  const handleDeleteClick = async (productId: string) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erro ao excluir produto. Por favor, tente novamente.';
      setError(errorMessage);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Estoque" showBackButton />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
        ) : (
          products.map((product) => (
            <Card key={product._id} style={styles.card}>
              <Card.Cover
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <Card.Content>
                <Text variant="titleLarge" style={styles.productName}>
                  {product.name}
                </Text>
                <Text variant="titleMedium" style={styles.productPrice}>
                  {formatPrice(product.price)}
                </Text>
                <Text variant="bodyMedium" style={styles.productDescription}>
                  {product.description}
                </Text>
                <Text variant="bodyMedium" style={styles.productQuantity}>
                  Quantidade: {product.quantity}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button 
                  onPress={() => handleEditClick(product)}
                  buttonColor="#383A29"
                  textColor="#d9d9d9"
                >
                  Editar
                </Button>
                <Button 
                  onPress={() => handleDeleteClick(product._id)}
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
        <Dialog visible={editModalVisible} onDismiss={() => setEditModalVisible(false)}>
          <Dialog.Title>Editar Produto</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Descrição"
              value={editForm.description}
              onChangeText={(text) => setEditForm({ ...editForm, description: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <TextInput
              label="Preço"
              value={editForm.price}
              onChangeText={(text) => setEditForm({ ...editForm, price: text.replace(/[^0-9.]/g, '') })}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <TextInput
              label="Quantidade"
              value={editForm.quantity}
              onChangeText={(text) => setEditForm({ ...editForm, quantity: text.replace(/[^0-9]/g, '') })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setEditModalVisible(false)}
              buttonColor="#383A29"
              textColor="#d9d9d9"
            >
              Cancelar
            </Button>
            <Button 
              onPress={handleEditSubmit}
              buttonColor="#383A29"
              textColor="#d9d9d9"
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  productImage: {
    height: 200,
  },
  productName: {
    marginTop: 8,
  },
  productPrice: {
    color: '#2196F3',
    marginTop: 4,
  },
  productDescription: {
    marginTop: 8,
    opacity: 0.7,
  },
  productQuantity: {
    marginTop: 8,
    color: '#666',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
});

export default ProductListScreen;