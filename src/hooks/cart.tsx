import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsAsync = await AsyncStorage.getItem('products');

      if (productsAsync) {
        setProducts(JSON.parse(productsAsync));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem('products', JSON.stringify(products));
    })();
  }, [products]);

  const addToCart = useCallback(async product => {
    setProducts(item => {
      const newProductsAsyncStorage = [...item];

      const checkIfProductAlreadyExists = newProductsAsyncStorage.findIndex(
        p => p.id === product.id,
      );

      if (checkIfProductAlreadyExists === -1) {
        newProductsAsyncStorage.push({ ...product, quantity: 1 });
      } else {
        newProductsAsyncStorage[checkIfProductAlreadyExists].quantity += 1;
      }

      return newProductsAsyncStorage;
    });
  }, []);

  const increment = useCallback(async id => {
    setProducts(item => {
      const newProducts = [...item];

      const ProductAlreadyExists = newProducts.findIndex(
        product => product.id === id,
      );

      if (!ProductAlreadyExists) {
        newProducts[ProductAlreadyExists].quantity += 1;
      }

      return newProducts;
    });
  }, []);

  const decrement = useCallback(id => {
    setProducts(item => {
      const newProducts = [...item];

      const ProductAlreadyExists = newProducts.findIndex(p => p.id === id);

      if (!ProductAlreadyExists) {
        if (newProducts[ProductAlreadyExists].quantity <= 1) {
          newProducts.splice(ProductAlreadyExists, 1);
        } else {
          newProducts[ProductAlreadyExists].quantity -= 1;
        }
      }

      return newProducts;
    });
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
