'use client';

import React, { createContext, useContext, useSyncExternalStore, useState, useCallback } from 'react';
import {
  ColorOption,
  Product,
  SizeOption,
  CustomCurtainItem,
  calculateFabricCurtainPricing,
  resolveSidePanelImage,
} from './shop-data';

export interface CartItem {
  id: string; // unique composite key
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
  basePrice?: number; // Curtain price without lining
  hasLining?: boolean; // Whether optional 10 JOD lining is enabled
  liningFee?: number; // 10 JOD if hasLining is true, else 0
  unitPrice: number; // in JOD (0 if unpriced)
  quantity: number;
  isCustom?: boolean;
  isUnpriced?: boolean;
  curtainStyle?: string; // 'ويفي' or 'أمريكي'
  fabricChoice?: string; // 'كتان طبيعي', 'مخمل ناعم', 'شيفون انسيابي', etc.
  patternId?: string;
  patternName?: string;
  liningOption?: string; // Only present when hasLining === true: '50%', '80%', '100%'
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

export interface CartAddOptions {
  curtainType?: string;
  curtainTypeName?: string;
  fabricId?: string;
  fabricName?: string;
  patternId?: string;
  patternName?: string;
  curtainStyle?: string;
  hasLining?: boolean;
  liningOption?: string;
  basePrice?: number;
  liningFee?: number;
  resolvedImage?: string;
  serviceLocation?: string;
  isService?: boolean;
  isDryCleaning?: boolean;
  isUnpriced?: boolean;
  sideSelection?: string;
  sideSelectionLabel?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    color: ColorOption,
    size: SizeOption,
    quantity?: number,
    options?: CartAddOptions
  ) => void;
  addCustomItem: (customItem: CustomCurtainItem) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  validateCartPrices: () => void;
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

function normalizeLiningPercentage(raw?: string): string {
  if (!raw) return '50%';
  if (raw.includes('100')) return '100%';
  if (raw.includes('80')) return '80%';
  if (raw.includes('50')) return '50%';
  return raw;
}

/**
 * Normalizes and validates a cart item loaded from storage or before checkout:
 * - Never silently adds a lining fee to saved legacy cart items (if hasLining is undefined, defaults to false and removes legacy liningOption).
 * - Recalculates Linen (0.24 JOD/cm) and Electric (0.48 JOD/cm) curtain prices + optional 10 JOD lining fee.
 * - Ensures Linen Side Panels use the exact color + placement image and 30/60 JOD pricing.
 */
export function normalizeAndValidateCartItem(item: CartItem): CartItem {
  if (!item || item.isCustom) return item;

  const isSidePanels =
    item.productId === 'curtain-linen-side-panels' ||
    item.curtainType === 'side_panels' ||
    Boolean(item.sideSelection);

  if (isSidePanels) {
    const placement =
      item.sideSelection === 'right' || item.sideSelection === 'left' || item.sideSelection === 'both'
        ? item.sideSelection
        : 'both';
    const expectedPrice = placement === 'both' ? 60 : 30;
    const { image: resolvedSideImg, isMissing } = resolveSidePanelImage(item.color?.id, placement);
    const updatedImage = !isMissing && resolvedSideImg ? resolvedSideImg : item.image;
    return {
      ...item,
      sideSelection: placement,
      unitPrice: expectedPrice,
      size: {
        ...item.size,
        price: expectedPrice,
      },
      image: updatedImage,
      hasLining: undefined,
      liningFee: undefined,
      liningOption: undefined,
    };
  }

  const isFabricCurtain =
    item.productId === 'curtain-electric' ||
    item.productId === 'curtain-manual' ||
    ((item.curtainType === 'electric' || item.curtainType === 'manual') &&
      !item.isService &&
      !item.isDryCleaning);

  if (isFabricCurtain) {
    const isElectric =
      item.productId === 'curtain-electric' || item.curtainType === 'electric';
    // Saved legacy items without explicit boolean hasLining must NOT silently receive a 10 JOD lining fee
    const hasLining = typeof item.hasLining === 'boolean' ? item.hasLining : false;
    const cleanLiningOption = hasLining ? normalizeLiningPercentage(item.liningOption) : undefined;
    const widthCm = item.size?.widthCm && item.size.widthCm > 0 ? item.size.widthCm : 250;

    const calc = calculateFabricCurtainPricing(
      isElectric ? 'electric' : 'manual',
      widthCm,
      hasLining,
      item.quantity
    );

    return {
      ...item,
      curtainType: isElectric ? 'electric' : 'manual',
      curtainTypeName: isElectric ? 'ستائر كهربائية' : 'ستائر لينين',
      hasLining,
      liningOption: cleanLiningOption,
      basePrice: calc.basePrice,
      liningFee: calc.liningFee,
      unitPrice: calc.unitPrice,
      size: {
        ...item.size,
        widthCm,
        price: calc.unitPrice,
      },
    };
  }

  return item;
}

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
        memoryCart = parsed.map(normalizeAndValidateCartItem);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memoryCart));
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
    options?: CartAddOptions
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

    const isScreenScreen = product.id === 'roller-screen';
    const isBlackoutCustom = product.id === 'roller-blackout';
    const isZebraCustom = product.id === 'roller-zebra';
    const isManualCustom = product.id === 'curtain-manual';
    const isElectricCustom = product.id === 'curtain-electric';
    const isFabricCurtainCustom = isManualCustom || isElectricCustom || curtainType === 'manual' || curtainType === 'electric';
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

    // Optional lining is ONLY for Linen & Electric curtains, and OFF by default
    const hasLining =
      !isSidePanels && !isTrackCustom && !isInstallationService && !isDryCleaning && isFabricCurtainCustom
        ? Boolean(options?.hasLining)
        : false;
    const liningOption = hasLining ? normalizeLiningPercentage(options?.liningOption) : undefined;

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

    // Authoritative price calculation for Linen & Electric curtains
    let basePrice = options?.basePrice;
    let liningFee = options?.liningFee;
    let computedUnitPrice = isDryCleaning ? 25 : (isUnpriced ? 0 : size.price);

    if (!isSidePanels && !isTrackCustom && !isInstallationService && !isDryCleaning && (isManualCustom || isElectricCustom)) {
      const calc = calculateFabricCurtainPricing(
        isElectricCustom ? 'electric' : 'manual',
        size.widthCm || 250,
        hasLining,
        quantity
      );
      basePrice = calc.basePrice;
      liningFee = calc.liningFee;
      computedUnitPrice = calc.unitPrice;
    } else if (isSidePanels) {
      const side = options?.sideSelection || 'both';
      computedUnitPrice = side === 'both' ? 60 : 30;
    }

    const unitPrice = computedUnitPrice;

    const styleKey = isTrackCustom || isInstallationService || isDryCleaning || isSidePanels ? '' : (curtainStyle || '');
    const liningKey = hasLining ? `lined_${liningOption || '50%'}` : 'nolining';
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

    const resolvedSidePanelImg = isSidePanels
      ? resolveSidePanelImage(color.id, options?.sideSelection || 'both').image
      : '';

    const finalImage =
      (isSidePanels && resolvedSidePanelImg) ||
      options?.resolvedImage ||
      product.mainImage ||
      color.image ||
      (isDryCleaning
        ? '/images/washing_curtains.jpg'
        : isInstallationService
        ? '/images/curtain_installation_service.png'
        : '/images/aluminum_curtain_track.jpg');

    const existingIndex = memoryCart.findIndex((item) => item.id === compositeId);
    if (existingIndex > -1) {
      memoryCart = memoryCart.map((item, idx) =>
        idx === existingIndex
          ? normalizeAndValidateCartItem({
              ...item,
              image: finalImage,
              quantity: item.quantity + quantity,
            })
          : item
      );
    } else {
      const newItem: CartItem = normalizeAndValidateCartItem({
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
        image: finalImage,
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
        size: {
          ...size,
          price: unitPrice,
        },
        basePrice,
        hasLining: isManualCustom || isElectricCustom ? hasLining : undefined,
        liningFee: isManualCustom || isElectricCustom ? liningFee : undefined,
        unitPrice,
        quantity,
        isCustom: false,
        isUnpriced: Boolean(isUnpriced),
        curtainStyle: isDryCleaning || isInstallationService || isTrackCustom || isSidePanels ? undefined : curtainStyle,
        fabricChoice: isDryCleaning || isInstallationService || isTrackCustom || isSidePanels ? undefined : fabricName,
        patternId: options?.patternId,
        patternName: options?.patternName,
        liningOption: isDryCleaning || isInstallationService || isTrackCustom || isSidePanels ? undefined : liningOption,
        serviceLocation: isDryCleaning ? 'داخل عمان فقط' : isInstallationService ? serviceLoc : undefined,
        isService: isDryCleaning || isInstallationService,
        isDryCleaning,
        sideSelection: isSidePanels ? (options?.sideSelection || 'both') : undefined,
        sideSelectionLabel: isSidePanels ? options?.sideSelectionLabel : undefined,
      });

      memoryCart = [...memoryCart, newItem];
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
      item.id === itemId ? normalizeAndValidateCartItem({ ...item, quantity: newQuantity }) : item
    );
    emitChange();
  },
  validateAll() {
    initCartFromStorage();
    memoryCart = memoryCart.map(normalizeAndValidateCartItem);
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
  const [isCheckoutOpen, setIsCheckoutOpenState] = useState(false);
  const [openProductModal, setOpenProductModal] = useState<Product | null>(null);
  const [isCustomQuoteOpen, setIsCustomQuoteOpen] = useState(false);

  const validateCartPrices = useCallback(() => {
    cartStore.validateAll();
  }, []);

  const setIsCheckoutOpen = useCallback((open: boolean) => {
    if (open) {
      cartStore.validateAll();
    }
    setIsCheckoutOpenState(open);
  }, []);

  const addItem = useCallback(
    (
      product: Product,
      color: ColorOption,
      size: SizeOption,
      quantity = 1,
      options?: CartAddOptions
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
  const subtotal = Math.round(
    items
      .filter((item) => !item.isCustom && !item.isUnpriced)
      .reduce((acc, curr) => acc + (curr.unitPrice || 0) * curr.quantity, 0) * 100
  ) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addCustomItem,
        updateQuantity,
        removeItem,
        clearCart,
        validateCartPrices,
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
