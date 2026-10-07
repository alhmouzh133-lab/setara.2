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
  patternId?: string;
  patternName?: string;
  liningOption?: string; // 'بطانة 50%', 'بطانة 80%', 'تعتيم 100% — Blackout'
  serviceLocation?: string; // 'داخل عمان' | 'خارج عمان'
  isService?: boolean;
  isDryCleaning?: boolean;
  sideSelection?: string; // 'right' | 'left' | 'both'
  sideSelectionLabel?: string;
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
      patternId?: string;
      patternName?: string;
      curtainStyle?: string;
      liningOption?: string;
      resolvedImage?: string;
      serviceLocation?: string;
      isService?: boolean;
      isDryCleaning?: boolean;
      isUnpriced?: boolean;
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
      patternId?: string;
      patternName?: string;
      curtainStyle?: string;
      liningOption?: string;
      resolvedImage?: string;
      serviceLocation?: string;
      isService?: boolean;
      isDryCleaning?: boolean;
      isUnpriced?: boolean;
      sideSelection?: string;
      sideSelectionLabel?: string;
    }
  ) {
    initCartFromStorage();
    const isDryCleaning =
      product.id === 'service-dry-cleaning' ||
      Boolean(product.isDryCleaningService) ||
      Boolean(options?.isDryCleaning);
    const curtainType = isDryCleaning ? 'service' : (options?.curtainType || product.curtainType || 'electric');
    const curtainTypeName = isDryCleaning
      ? 'غسيل وكي البرادي'
      : (options?.curtainTypeName || product.name);
    const fabricId = options?.fabricId || product.defaultFabricId || 'linen';
    const fabricName = options?.fabricName || 'كتان طبيعي';
    const curtainStyle = options?.curtainStyle || (curtainType !== 'roller' ? 'ويفي' : undefined);
    const liningOption = options?.liningOption || (curtainType !== 'roller' ? 'بطانة 50%' : undefined);

    const isScreenScreen = product.id === 'roller-screen';
    const isBlackoutCustom = product.id === 'roller-blackout';
    const isZebraCustom = product.id === 'roller-zebra';
    const isManualCustom = product.id === 'curtain-manual';
    const isElectricCustom = product.id === 'curtain-electric';
    const isTrackCustom =
      product.id === 'curtain-track-aluminum' ||
      product.category === 'tracks' ||
      Boolean(product.isTrackAccessory) ||
      options?.curtainType === 'track';
    const isInstallationService =
      (product.id === 'service-installation' ||
      product.category === 'services' ||
      Boolean(product.isInstallationService) ||
      options?.curtainType === 'service' ||
      Boolean(options?.isService)) && !isDryCleaning;
    const isSidePanels =
      product.id === 'curtain-linen-side-panels' ||
      Boolean(product.isLinenSidePanel) ||
      options?.curtainType === 'side_panels';

    const isPricedCustom =
      isScreenScreen ||
      isBlackoutCustom ||
      isZebraCustom ||
      isManualCustom ||
      isElectricCustom ||
      isTrackCustom ||
      isInstallationService ||
      isDryCleaning ||
      isSidePanels;
    const isUnpriced =
      options?.isUnpriced !== undefined
        ? options.isUnpriced
        : isPricedCustom
        ? false
        : curtainType === 'roller' || Boolean(product.isUnpriced);
    const unitPrice = isDryCleaning ? 25 : (isUnpriced ? 0 : size.price);

    const styleKey = isTrackCustom || isInstallationService || isDryCleaning ? '' : (curtainStyle || '');
    const liningKey = isTrackCustom || isInstallationService || isDryCleaning ? '' : (liningOption || '');
    const patternKey = options?.patternId || '';
    const serviceLoc = isDryCleaning
      ? 'داخل عمان فقط'
      : (options?.serviceLocation || (size.price === 25 ? 'خارج عمان' : 'داخل عمان'));
    const compositeId = isDryCleaning
      ? 'service_dry_cleaning'
      : isInstallationService
      ? `service_installation_${serviceLoc === 'خارج عمان' || size.price === 25 ? 'outside' : 'amman'}`
      : isTrackCustom
      ? `track_${color.id || 'std'}_${size.widthCm || 0}`
      : isSidePanels
      ? `side_panels_${color.id}_${options?.sideSelection || 'both'}`
      : isScreenScreen
      ? `roller_screen_${color.id}_${size.widthCm || 0}_${size.heightCm || 0}`
      : isBlackoutCustom
      ? `roller_blackout_${color.id}_${size.widthCm || 0}_${size.heightCm || 0}`
      : isZebraCustom
      ? `roller_zebra_${(fabricName || '').replace(/\s+/g, '_')}_${color.id}_${size.widthCm || 0}_${size.heightCm || 0}`
      : isElectricCustom
      ? `electric_${fabricId}_${patternKey}_${color.id}_${styleKey}_${liningKey}_${size.widthCm || 0}_${size.heightCm || 0}`
      : isManualCustom
      ? `manual_${fabricId}_${patternKey}_${color.id}_${styleKey}_${liningKey}_${size.widthCm || 0}_${size.heightCm || 0}`
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
          productName: isDryCleaning
            ? 'غسيل وكي البرادي'
            : isInstallationService
            ? 'طلب فني تركيب'
            : isTrackCustom
            ? 'جسر سكة ألمنيوم'
            : curtainTypeName,
          curtainType: isDryCleaning || isInstallationService ? 'service' : isTrackCustom ? 'track' : curtainType,
          curtainTypeName: isDryCleaning
            ? 'غسيل وكي البرادي'
            : isInstallationService
            ? 'طلب فني تركيب'
            : isTrackCustom
            ? 'جسر سكة ألمنيوم'
            : curtainTypeName,
          fabricId: isDryCleaning || isInstallationService || isTrackCustom ? '' : fabricId,
          fabricName: isDryCleaning || isInstallationService || isTrackCustom ? '' : fabricName,
          categoryName: product.categoryName || (isDryCleaning ? 'خدمات العناية والتركيب' : isInstallationService ? 'خدمات التركيب' : 'سكك وملحقات'),
          image:
            options?.resolvedImage ||
            product.mainImage ||
            color.image ||
            (isDryCleaning
              ? '/images/washing_curtains.jpg'
              : isInstallationService
              ? '/images/curtain_installation_service.png'
              : '/images/aluminum_curtain_track.jpg'),
          color: isDryCleaning
            ? {
                id: 'dry_cleaning_location',
                name: 'داخل عمان فقط',
                hex: '#C8AA78',
                image: product.mainImage || '/images/washing_curtains.jpg',
                gallery: [],
              }
            : isInstallationService
            ? {
                id: 'service_location',
                name: serviceLoc,
                hex: '#C8AA78',
                image: product.mainImage || '/images/curtain_installation_service.png',
                gallery: [],
              }
            : isTrackCustom
            ? {
                id: 'track_aluminum',
                name: 'ألمنيوم مدهون حرارياً',
                hex: '#FFFFFF',
                image: product.mainImage || '/images/aluminum_curtain_track.jpg',
                gallery: [],
              }
            : color,
          size,
          unitPrice,
          quantity,
          isCustom: false,
          isUnpriced: Boolean(isUnpriced),
          curtainStyle: isDryCleaning || isInstallationService || isTrackCustom ? undefined : curtainStyle,
          fabricChoice: isDryCleaning || isInstallationService || isTrackCustom ? undefined : fabricName,
          patternId: options?.patternId,
          patternName: options?.patternName,
          liningOption: isDryCleaning || isInstallationService || isTrackCustom ? undefined : liningOption,
          serviceLocation: isDryCleaning ? 'داخل عمان فقط' : isInstallationService ? serviceLoc : undefined,
          isService: isDryCleaning || isInstallationService,
          isDryCleaning,
          sideSelection: isSidePanels ? (options?.sideSelection || 'both') : undefined,
          sideSelectionLabel: isSidePanels ? options?.sideSelectionLabel : undefined,
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
        productName: `ستارة تفصيل: ${item.curtainType.trim() || 'حسب الطلب'}`,
        categoryName: 'تفصيل حسب الطلب',
        image: '/images/craft_textures.jpg',
        color: {
          id: `custom_${item.color.trim() || 'custom'}`,
          name: item.color.trim() || 'حسب الطلب',
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
        serviceLocation?: string;
        isService?: boolean;
        isDryCleaning?: boolean;
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
