import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  commission?: number;
  image?: string;
}

interface Sales {
  [productId: string]: number;
}

interface Sale {
  _id: string;
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  total: number;
  commission: number;
  createdAt: string;
}

const SalesScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sales>({});
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingProduct, setProcessingProduct] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products'); // Corrigido: adicionado /api
      const productsWithCommission = response.data.map((product: Product) => ({
        ...product,
        commission: product.commission || (product.price * 0.3)
      }));
      setProducts(productsWithCommission);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      if (user?._id) {
        const salesResponse = await api.get('/api/sales'); // Adicionado /api
        const userSales = salesResponse.data.filter((sale: Sale) => sale.userId === user._id);
        
        // Armazenar todas as vendas para calcular o total do backend
        setAllSales(userSales);
        
        const salesCount: Sales = {};
        userSales.forEach((sale: Sale) => {
          sale.products.forEach((product: any) => {
            // Garante que o ID é sempre string
            const id = typeof product.productId === 'object' ? product.productId._id : product.productId;
            salesCount[id] = (salesCount[id] || 0) + product.quantity;
          });
        });
        
        setSales(salesCount);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  };

  const handleQuantityChange = async (productId: string, increment: boolean) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
  
    const currentQuantity = sales[productId] || 0;
    if (!increment && currentQuantity === 0) return; // Não permite devolução abaixo de zero
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    
    setProcessingProduct(productId);
    
    try {
      const saleData = {
        products: [{
          productId: productId,
          quantity: increment ? 1 : -1
        }],
        total: increment ? product.price : -product.price
      };
  
      const response = await api.post('/api/sales', saleData);
      
      // Atualizar o estado local
      setSales(prevSales => ({
        ...prevSales,
        [productId]: newQuantity
      }));
      
      // Recarregar vendas para obter dados atualizados do backend
      await loadSales();
      
      setSuccess(increment ? 'Venda registrada!' : 'Devolução registrada!');
    } catch (error: any) {
      console.error('Erro ao processar venda:', error);
      console.log('Debug - Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Erro ao processar venda');
    } finally {
      setProcessingProduct(null);
    }

    // Validação extra: impedir quantidade ou total negativos
    if (increment && product.price < 0) {
      setError('Preço do produto não pode ser negativo.');
      setTimeout(() => setError(''), 3000);
      setProcessingProduct(null);
      return;
    }
    if (!increment && (currentQuantity <= 0 || product.price < 0)) {
      setError('Não é possível devolver mais do que foi vendido ou preço negativo.');
      setTimeout(() => setError(''), 3000);
      setProcessingProduct(null);
      return;
    }
  };

  // Calcular totais usando dados do backend
  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalSubtotal = 0;
    
    // Usar o total real do backend
    totalSubtotal = allSales.reduce((acc, sale) => acc + sale.total, 0);
    
    // Calcular quantidade total usando os dados atuais do estado
    Object.values(sales).forEach(quantity => {
      totalQuantity += Math.max(0, quantity); // Garantir que não seja negativo
    });
    
    return { totalQuantity, totalSubtotal };
  };

  const { totalQuantity, totalSubtotal } = calculateTotals();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={() => {
                loadProducts();
                loadSales();
              }} 
            />
          }
        >
          {/* Sales Summary */}
          <View style={styles.salesSummary}>
            <Text style={styles.summaryTitle}>Resumo de Vendas</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total de Vendas:</Text>
                <Text style={styles.summaryValue}>{totalQuantity}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total:</Text>
                <Text style={styles.summaryValue}>R$ {totalSubtotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Alert Info */}
          <View style={styles.alertInfo}>
            <Text style={styles.alertText}>
              Cada clique em + registra uma venda imediata. Cada clique em - registra uma devolução.
            </Text>
          </View>

          {/* Products Table */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Produtos Disponíveis</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.productColumn]}>Produto</Text>
              <Text style={[styles.tableHeaderText, styles.priceColumn]}>Preço</Text>
              <Text style={[styles.tableHeaderText, styles.commissionColumn]}>Comissão</Text>
              <Text style={[styles.tableHeaderText, styles.actionsColumn]}>Ações</Text>
            </View>

            {/* Table Body */}
            {products.map((product) => {
              const quantity = sales[product._id] || 0;
              const commission = product.commission || (product.price * 0.3);
              const isProcessing = processingProduct === product._id;
              
              return (
                <View key={product._id} style={styles.tableRow}>
                  <View style={styles.productColumn}>
                    <Text style={styles.productName}>{product.name}</Text>
                    {quantity > 0 && (
                      <Text style={styles.productQuantity}>Vendas: {quantity}</Text>
                    )}
                  </View>
                  
                  <View style={styles.priceColumn}>
                    <Text style={styles.priceText}>R$ {product.price.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.commissionColumn}>
                    <Text style={styles.commissionText}>R$ {commission.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.actionsColumn}>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.removeButton]}
                        onPress={() => handleQuantityChange(product._id, false)}
                        disabled={quantity === 0 || isProcessing}
                      >
                        <Text style={styles.removeButtonText}>-</Text>
                      </TouchableOpacity>
                      
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#383A29" style={styles.loadingIcon} />
                      ) : (
                        <View style={styles.actionLabel}>
                          {/* Texto "Vender" removido */}
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.addButton]}
                        onPress={() => handleQuantityChange(product._id, true)}
                        disabled={isProcessing}
                      >
                        <Text style={styles.addButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Success/Error Messages */}
        {success ? (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}
        
        {error ? (
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50, // Adiciona espaço superior para evitar sobreposição com o painel de controle do iOS
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#383A29',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#383A29',
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  salesSummary: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 20, // Adiciona margem superior extra
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#383A29',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#383A29',
  },
  alertInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  alertText: {
    color: '#1976d2',
    fontSize: 14,
    lineHeight: 20,
  },
  tableContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#383A29',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#383A29',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  productColumn: {
    flex: 3,
    paddingRight: 8,
  },
  priceColumn: {
    flex: 2,
    alignItems: 'center',
  },
  commissionColumn: {
    flex: 2,
    alignItems: 'center',
  },
  actionsColumn: {
    flex: 3,
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#383A29',
  },
  productQuantity: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '500',
    marginTop: 2,
  },
  priceText: {
    fontSize: 14,
    color: '#383A29',
  },
  commissionText: {
    fontSize: 14,
    color: '#383A29',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#f44336',
  },
  addButton: {
    backgroundColor: '#4caf50',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionLabel: {
    minWidth: 20,
    alignItems: 'center',
  },
  actionLabelText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  loadingIcon: {
    minWidth: 20,
  },
  successMessage: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorMessage: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SalesScreen;