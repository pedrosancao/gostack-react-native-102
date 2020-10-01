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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedCart = await AsyncStorage.getItem('@GoMarktplace:cart');
      if (storedCart) {
        setProducts(JSON.parse(storedCart));
      }
    }

    loadProducts();
  }, []);

  const saveCard = useCallback(async () => {
    await AsyncStorage.setItem('@GoMarktplace:cart', JSON.stringify(products));
  }, [products]);

  const addToCart = useCallback(
    async product => {
      let inCart = false;
      const updatedProducts = products.map(productInCart => {
        if (productInCart.id === product.id) {
          inCart = true;
          return { ...productInCart, quantity: productInCart.quantity + 1 };
        }
        return productInCart;
      });
      setProducts(
        inCart ? updatedProducts : [...products, { ...product, quantity: 1 }],
      );
      await saveCard();
    },
    [products, saveCard],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity + 1 }
            : product,
        ),
      );
      await saveCard();
    },
    [products, saveCard],
  );

  const decrement = useCallback(
    async id => {
      setProducts(
        products
          .map(product =>
            product.id === id
              ? { ...product, quantity: product.quantity - 1 }
              : product,
          )
          .filter(product => product.quantity > 0),
      );
      await saveCard();
    },
    [products, saveCard],
  );

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
