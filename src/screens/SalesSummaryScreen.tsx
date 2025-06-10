import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Surface, List, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { getSalesSummary } from '../services/api';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

interface SaleProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  _id: string;
  userId: string;
  userName: string;
  products: SaleProduct[];
  total: number;
  commission: number;
  createdAt: string;
}

interface GroupedSales {
  userId: string;
  userName: string;
  sales: Sale[];
  totalValue: number;
  totalCommission: number;
}

export default function SalesSummaryScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<{[key: string]: boolean}>({});
  const navigation = useNavigation();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigation.goBack();
      return;
    }
    fetchSales();
  }, [isAdmin]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesSummary();
      
      // Formatar dados como no frontend
      const formattedSales = response.map((sale: any) => {
        // Agrupar produtos iguais
        const groupedProducts = sale.products.reduce((acc: any, product: any) => {
          const key = product.productId;
          if (!acc[key]) {
            acc[key] = {
              productId: product.productId,
              name: product.name,
              quantity: 0,
              price: product.price,
              subtotal: 0
            };
          }
          acc[key].quantity += product.quantity;
          acc[key].subtotal += product.quantity * product.price;
          return acc;
        }, {});

        const total = Number(sale.total) || 0;
        const commission = Number(sale.commission) || Number((total * 0.3).toFixed(2));

        return {
          _id: sale._id,
          userId: sale.userId,
          userName: sale.userName || 'Usuário não identificado',
          products: Object.values(groupedProducts),
          total,
          commission,
          createdAt: sale.createdAt
        };
      });
      
      setSales(formattedSales);
    } catch (err) {
      console.error('Erro ao carregar vendas:', err);
      setError('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Agrupar vendas por usuário
  const groupedSales = sales.reduce((acc: { [key: string]: GroupedSales }, sale) => {
    const userId = sale.userId;
    
    if (!acc[userId]) {
      acc[userId] = {
        userId: sale.userId,
        userName: sale.userName,
        sales: [],
        totalValue: 0,
        totalCommission: 0
      };
    }
    
    acc[userId].sales.push(sale);
    acc[userId].totalValue += sale.total;
    acc[userId].totalCommission += sale.commission;
    
    return acc;
  }, {});

  // Converter para array e ordenar por valor total
  const groupedSalesArray = Object.values(groupedSales).sort((a, b) => b.totalValue - a.totalValue);

  // Calcular totais gerais
  const totalVendas = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalComissoes = sales.reduce((acc, sale) => acc + sale.commission, 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Resumo de Vendas" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando vendas...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Resumo de Vendas" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Resumo de Vendas" showBackButton={true} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma venda encontrada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Resumo de Vendas" showBackButton={true} />
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSales} />
        }
      >
        {/* Cards de totais */}
        <View style={styles.totalsContainer}>
          <Surface style={[styles.totalCard, styles.salesCard]}>
            <Text style={styles.totalLabel}>Total de Vendas</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalVendas)}</Text>
          </Surface>
          <Surface style={[styles.totalCard, styles.commissionCard]}>
            <Text style={styles.totalLabel}>Total de Comissões</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalComissoes)}</Text>
          </Surface>
        </View>

        {/* Lista de vendedoras */}
        {groupedSalesArray.map((userGroup) => (
          <Card key={userGroup.userId} style={styles.userCard}>
            <List.Accordion
              title={userGroup.userName}
              description={`${userGroup.sales.length} venda${userGroup.sales.length > 1 ? 's' : ''} - ${formatCurrency(userGroup.totalValue)}`}
              expanded={expandedUsers[userGroup.userId]}
              onPress={() => toggleUserExpansion(userGroup.userId)}
              titleStyle={styles.accordionTitle}
              descriptionStyle={styles.accordionDescription}
            >
              {userGroup.sales.map((sale, saleIndex) => (
                <View key={sale._id}>
                  <Card style={styles.saleCard}>
                    <Card.Content>
                      <Text style={styles.saleTitle}>
                        Venda #{saleIndex + 1} - {new Date(sale.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      
                      {/* Produtos da venda */}
                      {sale.products.map((product, index) => (
                        <View key={index} style={styles.productRow}>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productDetails}>
                              {product.quantity}x {formatCurrency(product.price)}
                            </Text>
                          </View>
                          <Text style={styles.productSubtotal}>
                            {formatCurrency(product.subtotal)}
                          </Text>
                        </View>
                      ))}
                      
                      <Divider style={styles.divider} />
                      
                      {/* Totais da venda */}
                      <View style={styles.saleFooter}>
                        <View style={styles.saleTotal}>
                          <Text style={styles.saleTotalLabel}>Total:</Text>
                          <Text style={styles.saleTotalValue}>{formatCurrency(sale.total)}</Text>
                        </View>
                        <View style={styles.saleCommission}>
                          <Text style={styles.saleCommissionLabel}>Comissão:</Text>
                          <Text style={styles.saleCommissionValue}>{formatCurrency(sale.commission)}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                  {saleIndex < userGroup.sales.length - 1 && <View style={styles.saleSpacing} />}
                </View>
              ))}
              
              {/* Resumo total do usuário */}
              <Surface style={styles.userSummary}>
                <Text style={styles.userSummaryTitle}>Resumo de {userGroup.userName}</Text>
                <View style={styles.userSummaryRow}>
                  <Text style={styles.userSummaryLabel}>Total de Vendas:</Text>
                  <Text style={styles.userSummaryValue}>{formatCurrency(userGroup.totalValue)}</Text>
                </View>
                <View style={styles.userSummaryRow}>
                  <Text style={styles.userSummaryLabel}>Total de Comissões:</Text>
                  <Text style={styles.userSummaryValue}>{formatCurrency(userGroup.totalCommission)}</Text>
                </View>
              </Surface>
            </List.Accordion>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#d9d9d9',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d9d9d9',
    textAlign: 'center',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#d9d9d9',
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#383A29',
    textAlign: 'center',
  },
  totalCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#383A29',
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#d9d9d9',
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#383A29',
  },
  userStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
});