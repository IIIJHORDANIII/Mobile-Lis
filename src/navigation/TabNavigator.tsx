import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SalesScreen from '../screens/SalesScreen';

export type TabParamList = {
  HomeTab: undefined;
  SalesTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Componente simples para ícones de texto
const TextIcon = ({ name, color, size }: { name: string; color: string; size: number }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>
    {name === 'home' ? '🏠' : '🛒'}
  </Text>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#383A29',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <TextIcon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="SalesTab" 
        component={SalesScreen}
        options={{
          tabBarLabel: 'Vendas',
          tabBarIcon: ({ color, size }) => (
            <TextIcon name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}