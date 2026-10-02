'use client';

import React, { createContext, useContext, useSyncExternalStore, useState, useCallback } from 'react';
import { ColorOption, Product, SizeOption } from './shop-data';

export interface CartItem {
  id: string; // unique composite key: `${productId}_${color.id}_${size.id}`
  productId: string;
  productName: string;
  categoryName: string;
  image: string;
  color: ColorOption;
  size: SizeOption;
  unitPrice: number; // in JOD
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color: ColorOption, size: SizeOption, quantity?: number) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  openProductModal: Product | null;
  setOpenProductModal: (product: Product | null) => void;
  isCustomQuoteOpen: boolean;
  setIsCustomQuoteOpen: (open: boolean) => void;
  isOrdersOpen: boolean;
  setIsOrdersOpen: (open: boolean) => void;
  selectedOrderRef: string | null;
  setSelectedOrderRef: (ref: string | null) => void;
  openOrderDetails: (ref: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'setara_cart_v1';
const LEGACY_STORAGE_KEY = 'dar_alsetaer_cart_v1';

const EMPTY_CART: CartItem[] = [];

let memoryCart: CartItem[] = [];
let listeners: Array<() => void> = [];
let isInitialized = false;

function initCartFromStorage() {
  if (isInitialized || typeof window === 'undefined') return;
  try {
    let stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      // Migrate from legacy key if present
      stored = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, stored);
      }
    }
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        memoryCart = parsed;
      }
    }
  } catch {
    // silent catch
  }
  isInitialized = true;
}

function emitChange() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memoryCart));
    } catch {
      // ignore quota
    }
  }
  for (const listener of listeners) {
    listener();
  }
}

const cartStore = {
  add(product: Product, color: ColorOption, size: SizeOption, quantity = 1) {
    initCartFromStorage();
    const compositeId = `${product.id}_${color.id}_${size.id}`;
    const existingIndex = memoryCart.findIndex((item) => item.id === compositeId);
    if (existingIndex > -1) {
      memoryCart = memoryCart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      memoryCart = [
        ...memoryCart,
        {
          id: compositeId,
          productId: product.id,
          productName: product.name,
          categoryName: product.categoryName,
          image: color.image || product.images[0] || '/images/hero.jpg',
          color,
          size,
          unitPrice: size.price,
          quantity,
        },
      ];
    }
    emitChange();
  },
  updateQuantity(itemId: string, newQuantity: number) {
    initCartFromStorage();
    if (newQuantity <= 0) {
      cartStore.remove(itemId);
      return;
    }
    memoryCart = memoryCart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    emitChange();
  },
  remove(itemId: string) {
    initCartFromStorage();
    memoryCart = memoryCart.filter((item) => item.id !== itemId);
    emitChange();
  },
  clear() {
    memoryCart = [];
    emitChange();
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    initCartFromStorage();
    return memoryCart;
  },
  getServerSnapshot() {
    return EMPTY_CART;
  },
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [openProductModal, setOpenProductModal] = useState<Product | null>(null);
  const [isCustomQuoteOpen, setIsCustomQuoteOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedOrderRef, setSelectedOrderRef] = useState<string | null>(null);

  const openOrderDetails = useCallback((ref: string) => {
    setSelectedOrderRef(ref);
    setIsOrdersOpen(true);
  }, []);

  const addItem = useCallback(
    (product: Product, color: ColorOption, size: SizeOption, quantity = 1) => {
      cartStore.add(product, color, size, quantity);
      setIsCartOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    cartStore.updateQuantity(itemId, newQuantity);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    cartStore.remove(itemId);
  }, []);

  const clearCart = useCallback(() => {
    cartStore.clear();
  }, []);

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openProductModal,
        setOpenProductModal,
        isCustomQuoteOpen,
        setIsCustomQuoteOpen,
        isOrdersOpen,
        setIsOrdersOpen,
        selectedOrderRef,
        setSelectedOrderRef,
        openOrderDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
