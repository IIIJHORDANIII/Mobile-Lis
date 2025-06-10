export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  TabNavigator: undefined;
  ProductForm: { productId?: string };
  ProductList: { listId?: string }; // Adicionar parâmetro opcional
  StockList: undefined;
  Register: undefined;
  Sales: undefined;
  CreateAdmin: undefined;
  CustomListDisplay: { listId: string };
  SalesSummary: undefined;
  CustomListForm: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  SalesTab: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;