import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import ProductListScreen from '../screens/ProductListScreen';
import StockListScreen from '../screens/StockListScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SalesScreen from '../screens/SalesScreen';
import CreateAdminScreen from '../screens/CreateAdminScreen';
import CustomListDisplayScreen from '../screens/CustomListDisplayScreen';
import CustomListFormScreen from '../screens/CustomListFormScreen';
import SalesSummaryScreen from '../screens/SalesSummaryScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* Para usuários padrão (não admin), mostrar tabs */}
          {!isAdmin ? (
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
          ) : (
            /* Para admins, manter navegação stack normal */
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
          
          {/* Telas comuns para todos os usuários logados */}
          <Stack.Screen name="ProductForm" component={ProductFormScreen} />
          <Stack.Screen name="ProductList" component={ProductListScreen} />
          <Stack.Screen name="StockList" component={StockListScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Sales" component={SalesScreen} />
          <Stack.Screen 
            name="SalesSummary" 
            component={SalesSummaryScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen name="CreateAdmin" component={CreateAdminScreen} />
          <Stack.Screen name="CustomListDisplay" component={CustomListDisplayScreen} />
          <Stack.Screen name="CustomListForm" component={CustomListFormScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}