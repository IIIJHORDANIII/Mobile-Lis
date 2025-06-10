import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Button, Card, Surface, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
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

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAdmin, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erro ao carregar produtos. Verifique sua conexão.';
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Confirmar Saída',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut }
      ]
    );
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const renderProductCard = (product: Product, index: number) => (
    <Card key={product._id} style={styles.productCard}>
      <Card.Cover 
        source={{ uri: product.image || 'https://via.placeholder.com/300x200' }} 
        style={styles.productImage}
        resizeMode="contain"
      />
      <Card.Content style={styles.productContent}>
        <View style={styles.productHeader}>
          <Surface style={styles.productIndex}>
            <Text style={styles.productIndexText}>{index + 1}</Text>
          </Surface>
        </View>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Estoque:</Text>
            <Text style={styles.quantityValue}>{product.quantity}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAdminMenu = () => {
    if (!isAdmin) return null;

    return (
      <View style={styles.adminMenuContainer}>
        <Text style={styles.adminMenuTitle}>Painel Administrativo</Text>
        <View style={styles.adminButtonsContainer}>
          <Button 
            mode="contained" 
            style={[styles.adminButton, styles.stockButton]}
            onPress={() => navigation.navigate('StockList')}
            icon="package-variant"
          >
            Estoque
          </Button>
          
          <Button 
            mode="contained" 
            style={[styles.adminButton, styles.productButton]}
            onPress={() => navigation.navigate('ProductForm')}
            icon="plus-circle"
          >
            Cadastro de Produto
          </Button>
          
          <Button 
            mode="contained" 
            style={[styles.adminButton, styles.userButton]}
            onPress={() => navigation.navigate('Register')}
            icon="account-plus"
          >
            Cadastro de Vendedora
          </Button>
          
          <Button 
            mode="contained" 
            style={[styles.adminButton, styles.listButton]}
            onPress={() => navigation.navigate('CustomListForm')}
            icon="format-list-bulleted"
          >
            Cadastro de Lista
          </Button>
          
          <Button 
            mode="contained" 
            style={[styles.adminButton, styles.summaryButton]}
            onPress={() => navigation.navigate('SalesSummary')}
            icon="chart-line"
          >
            Summary Vendas
          </Button>
          
          <Button 
            mode="contained" 
            style={[styles.adminButton, styles.createUserButton]}
            onPress={() => navigation.navigate('CreateAdmin')}
            icon="account-cog"
          >
            Criar Usuário
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Produtos" showLogout={true} />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadProducts} style={styles.retryButton}>
            Tentar Novamente
          </Button>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderAdminMenu()}
          
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
              <Text style={styles.emptySubtext}>Verifique sua conexão ou tente novamente</Text>
              <Button mode="contained" onPress={loadProducts} style={styles.retryButton}>
                Recarregar
              </Button>
            </View>
          ) : (
            products.map((product, index) => renderProductCard(product, index))
          )}
        </ScrollView>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  adminMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  adminMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#383A29',
    marginBottom: 16,
    textAlign: 'center',
  },
  adminButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  adminButton: {
    width: '48%',
    marginBottom: 12,
    paddingVertical: 8,
  },
  stockButton: {
    backgroundColor: '#4CAF50',
  },
  productButton: {
    backgroundColor: '#2196F3',
  },
  userButton: {
    backgroundColor: '#FF9800',
  },
  listButton: {
    backgroundColor: '#9C27B0',
  },
  summaryButton: {
    backgroundColor: '#F44336',
  },
  createUserButton: {
    backgroundColor: '#607D8B',
  },
  productCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderRadius: 12,
  },
  productContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    height: 300,
    backgroundColor: '#f8f8f8',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIndex: {
    backgroundColor: '#383A29',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  productIndexText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 26,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
  },
});