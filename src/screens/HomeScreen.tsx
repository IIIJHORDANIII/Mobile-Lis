import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Button, Card, Surface, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { api } from '../services/api';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAdmin, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      setError('');
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
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

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  // Filtrar produtos quando selectedCategory ou products mudarem
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

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
      
      {/* Botões de filtro por categoria */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filtrar por categoria:</Text>
        <View style={styles.filterButtonsContainer}>
          <Button
            mode={selectedCategory === 'all' ? 'contained' : 'outlined'}
            onPress={() => handleCategoryFilter('all')}
            style={[
              styles.filterButton,
              selectedCategory === 'all' && styles.filterButtonSelected
            ]}
            labelStyle={[
              styles.filterButtonLabel,
              selectedCategory === 'all' && styles.filterButtonLabelSelected
            ]}
            buttonColor="#383A29"
            textColor={selectedCategory === 'all' ? '#d9d9d9' : '#383A29'}
          >
            Todos
          </Button>
          <Button
            mode={selectedCategory === 'masculino' ? 'contained' : 'outlined'}
            onPress={() => handleCategoryFilter('masculino')}
            style={[
              styles.filterButton,
              selectedCategory === 'masculino' && styles.filterButtonSelected
            ]}
            labelStyle={[
              styles.filterButtonLabel,
              selectedCategory === 'masculino' && styles.filterButtonLabelSelected
            ]}
            buttonColor="#383A29"
            textColor={selectedCategory === 'masculino' ? '#d9d9d9' : '#383A29'}
          >
            Masculino
          </Button>
          <Button
            mode={selectedCategory === 'feminino' ? 'contained' : 'outlined'}
            onPress={() => handleCategoryFilter('feminino')}
            style={[
              styles.filterButton,
              selectedCategory === 'feminino' && styles.filterButtonSelected
            ]}
            labelStyle={[
              styles.filterButtonLabel,
              selectedCategory === 'feminino' && styles.filterButtonLabelSelected
            ]}
            buttonColor="#383A29"
            textColor={selectedCategory === 'feminino' ? '#d9d9d9' : '#383A29'}
          >
            Feminino
          </Button>
          <Button
            mode={selectedCategory === 'infantil' ? 'contained' : 'outlined'}
            onPress={() => handleCategoryFilter('infantil')}
            style={[
              styles.filterButton,
              selectedCategory === 'infantil' && styles.filterButtonSelected
            ]}
            labelStyle={[
              styles.filterButtonLabel,
              selectedCategory === 'infantil' && styles.filterButtonLabelSelected
            ]}
            buttonColor="#383A29"
            textColor={selectedCategory === 'infantil' ? '#d9d9d9' : '#383A29'}
          >
            Infantil
          </Button>
        </View>
        <Text style={styles.productCount}>
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
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
          
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
              <Text style={styles.emptySubtext}>
                {selectedCategory === 'all' 
                  ? 'Verifique sua conexão ou tente novamente' 
                  : `Nenhum produto na categoria "${selectedCategory}" encontrado`
                }
              </Text>
              <Button mode="contained" onPress={loadProducts} style={styles.retryButton}>
                Recarregar
              </Button>
            </View>
          ) : (
            filteredProducts.map((product, index) => renderProductCard(product, index))
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
  filterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 58, 41, 0.1)',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383A29',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
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
    width: '48%',
    marginBottom: 8,
  },
  filterButtonSelected: {
    backgroundColor: '#383A29',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#383A29',
    textTransform: 'none',
  },
  filterButtonLabelSelected: {
    color: '#d9d9d9',
    fontSize: 14,
    fontWeight: '600',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});