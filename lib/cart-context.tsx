'use client';

import React, { createContext, useContext, useSyncExternalStore, useState, useCallback } from 'react';
import { ColorOption, Product, SizeOption, CustomCurtainItem } from './shop-data';

export interface CartItem {
  id: string; // unique composite key: `${curtainType}_${fabricId}_${color.id}_${size.id}_${curtainStyle || ''}_${liningOption || ''}` or `custom_${id}`
  productId: string;
  productName: string;
  categoryName: string;
  curtainType?: 'electric' | 'manual' | 'roller' | string;
  curtainTypeName?: string;
  fabricId?: string;
  fabricName?: string;
  image: string;
  color: ColorOption;
  size: SizeOption;
  unitPrice: number; // in JOD (0 if unpriced)
  quantity: number;
  isCustom?: boolean;
  isUnpriced?: boolean;
  curtainStyle?: string; // 'ويفي' or 'أمريكي'
  fabricChoice?: string; // 'كتان طبيعي', 'مخمل ناعم', 'شيفون انسيابي', etc.
  liningOption?: string; // 'بطانة 50%', 'بطانة 80%', 'تعتيم 100% — Blackout'
  customDetails?: {
    curtainType: string;
    fabric: string;
    color: string;
    customColorNote?: string;
    widthCm: string;
    heightCm: string;
    roomLocation?: string;
    itemNotes?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    color: ColorOption,
    size: SizeOption,
    quantity?: number,
    options?: {
      curtainType?: string;
      curtainTypeName?: string;
      fabricId?: string;
      fabricName?: string;
      curtainStyle?: string;
      liningOption?: string;
      resolvedImage?: string;
    }
  ) => void;
  addCustomItem: (customItem: CustomCurtainItem) => void;
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
  add(
    product: Product,
    color: ColorOption,
    size: SizeOption,
    quantity = 1,
    options?: {
      curtainType?: string;
      curtainTypeName?: string;
      fabricId?: string;
      fabricName?: string;
      curtainStyle?: string;
      liningOption?: string;
      resolvedImage?: string;
    }
  ) {
    initCartFromStorage();
    const curtainType = options?.curtainType || product.curtainType || 'electric';
    const curtainTypeName = options?.curtainTypeName || product.name;
    const fabricId = options?.fabricId || product.defaultFabricId || 'linen';
    const fabricName = options?.fabricName || 'كتان طبيعي';
    const curtainStyle = options?.curtainStyle || (curtainType !== 'roller' ? 'ويفي' : undefined);
    const liningOption = options?.liningOption || (curtainType !== 'roller' ? 'بطانة 50%' : undefined);

    const isScreenScreen = product.id === 'roller-screen';
    const isBlackoutCustom = product.id === 'roller-blackout';
    const isZebraCustom = product.id === 'roller-zebra';
    const isPricedRoller = isScreenScreen || isBlackoutCustom || isZebraCustom;
    const isUnpriced = isPricedRoller ? false : (curtainType === 'roller' || Boolean(product.isUnpriced));
    const unitPrice = isUnpriced ? 0 : size.price;

    const styleKey = curtainStyle || '';
    const liningKey = liningOption || '';
    const compositeId = isScreenScreen
      ? `roller_screen_${color.id}_${size.widthCm || 0}_${size.heightCm || 0}`
      : isBlackoutCustom
      ? `roller_blackout_${color.id}_${size.widthCm || 0}_${size.heightCm || 0}`
      : isZebraCustom
      ? `roller_zebra_${(fabricName || '').replace(/\s+/g, '_')}_${color.id}_${size.widthCm || 0}_${size.heightCm || 0}`
      : `${curtainType}_${fabricId}_${color.id}_${size.id}_${styleKey}_${liningKey}`;

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
          productName: curtainTypeName,
          curtainType,
          curtainTypeName,
          fabricId,
          fabricName,
          categoryName: product.categoryName,
          image: options?.resolvedImage || color.image || product.images[0] || '/images/hero.jpg',
          color,
          size,
          unitPrice,
          quantity,
          isCustom: false,
          isUnpriced,
          curtainStyle,
          fabricChoice: fabricName,
          liningOption,
        },
      ];
    }
    emitChange();
  },
  addCustom(item: CustomCurtainItem) {
    initCartFromStorage();
    const customId = `custom_${item.id}`;
    memoryCart = [
      ...memoryCart,
      {
        id: customId,
        productId: 'custom_curtain',
        productName: `ستارة تفصيل: ${item.curtainType}`,
        categoryName: 'تفصيل حسب الطلب',
        image: '/images/craft_textures.jpg',
        color: {
          id: `custom_${item.color}`,
          name: item.color + (item.customColorNote ? ` (${item.customColorNote})` : ''),
          hex: '#C8AA78',
          image: '/images/craft_textures.jpg',
          gallery: [],
        },
        size: {
          id: `custom_size_${item.id}`,
          label: `${item.widthCm} × ${item.heightCm} سم`,
          widthCm: parseFloat(item.widthCm) || 0,
          heightCm: parseFloat(item.heightCm) || 0,
          price: 0,
        },
        unitPrice: 0,
        quantity: item.quantity || 1,
        isCustom: true,
        customDetails: {
          curtainType: item.curtainType,
          fabric: item.fabric,
          color: item.color,
          customColorNote: item.customColorNote,
          widthCm: item.widthCm,
          heightCm: item.heightCm,
          roomLocation: item.roomLocation,
          itemNotes: item.itemNotes,
        },
      },
    ];
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

  const addItem = useCallback(
    (
      product: Product,
      color: ColorOption,
      size: SizeOption,
      quantity = 1,
      options?: {
        curtainType?: string;
        curtainTypeName?: string;
        fabricId?: string;
        fabricName?: string;
        curtainStyle?: string;
        liningOption?: string;
        resolvedImage?: string;
      }
    ) => {
      cartStore.add(product, color, size, quantity, options);
      setIsCartOpen(true);
    },
    []
  );

  const addCustomItem = useCallback((customItem: CustomCurtainItem) => {
    cartStore.addCustom(customItem);
    setIsCartOpen(true);
  }, []);

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
  const subtotal = items
    .filter((item) => !item.isCustom && !item.isUnpriced)
    .reduce((acc, curr) => acc + (curr.unitPrice || 0) * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addCustomItem,
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
