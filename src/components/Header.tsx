import React from 'react';
import { StyleSheet, Image, View, Alert } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
  onBackPress?: () => void;
  showLogout?: boolean;
};

export default function Header({ 
  title, 
  showBackButton = false, 
  rightAction,
  onBackPress,
  showLogout = false
}: HeaderProps) {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Saída',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <Appbar.Header style={styles.header}>
      {showBackButton && (
        <Appbar.BackAction 
          onPress={onBackPress || (() => navigation.goBack())} 
        />
      )}
      <View style={styles.leftContainer}>
        <Image 
          source={require('../../LisMobile/assets/LogoVector.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {user?.name && (
          <Text style={styles.subtitle}>{user.name}</Text>
        )}
      </View>
      <View style={styles.spacer} />
      <View style={styles.rightContainer}>
        {showLogout && (
          <Appbar.Action 
            icon="logout" 
            iconColor="#d9d9d9"
            onPress={handleLogout}
          />
        )}
        {rightAction && React.cloneElement(rightAction as React.ReactElement, {
          textColor: '#d9d9d9'
        })}
      </View>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#383A29',
    elevation: 0,
  },
  leftContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 8,
  },
  logo: {
    height: 32,
    width: 120,
  },
  subtitle: {
    fontSize: 12,
    color: '#d9d9d9',
    marginTop: 2,
  },
  spacer: {
    flex: 1,
  },
  rightContainer: {
    minWidth: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 16,
  },
});