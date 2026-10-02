'use client';

import { CartItem } from './cart-context';
import { CustomCurtainItem, SHOP_CONFIG } from './shop-data';

export type OrderType = 'ready_made' | 'custom_quote';
export type OrderStatus = 'pending' | 'cancelled';

export interface ReadyMadeOrderItemSnapshot {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  image: string;
  colorName: string;
  colorHex: string;
  sizeLabel: string;
  widthCm: number;
  heightCm: number;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
}

export interface CustomCurtainOrderItemSnapshot {
  id: string;
  curtainType: string;
  fabric: string;
  color: string;
  customColorNote?: string;
  widthCm: string;
  heightCm: string;
  quantity: number;
  roomLocation?: string;
  itemNotes?: string;
}

export interface OrderCustomerSnapshot {
  fullName: string;
  phone: string;
  city: string;
  address?: string;
  notes?: string;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  time: string;
  timestamp: string;
  description?: string;
  type: 'creation' | 'cancellation' | 'info';
}

export interface OrderRecord {
  id: string;
  orderRef: string;
  type: OrderType;
  typeLabel: 'شراء ستائر جاهزة' | 'طلب تفصيل';
  createdAt: string; // ISO string
  createdFormatted: string; // Human readable Arabic string
  status: OrderStatus;
  statusLabel: 'قيد المراجعة' | 'ملغي';
  cancelledAt?: string;
  cancelledFormatted?: string;
  customer: OrderCustomerSnapshot;
  // For ready_made:
  readyMadeItems?: ReadyMadeOrderItemSnapshot[];
  subtotal?: number;
  deliveryPricingNote?: string;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  // For custom_quote:
  customItems?: CustomCurtainOrderItemSnapshot[];
  totalNote?: string;
  // Actual occurred timeline events only
  timeline: OrderTimelineEvent[];
}

export const ORDERS_STORAGE_KEY = 'setara_orders_v1';

let memoryOrders: OrderRecord[] | null = null;
let listeners: Array<() => void> = [];

export function formatArabicDateTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleString('ar-JO');
  }
}

function loadOrdersFromStorage(): OrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read orders from localStorage:', e);
  }
  return [];
}

function persistOrders(orders: OrderRecord[]): void {
  memoryOrders = orders;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to write orders to localStorage:', e);
    }
  }
  listeners.forEach((l) => l());
}

export const orderStorage = {
  getOrders(): OrderRecord[] {
    if (memoryOrders === null) {
      memoryOrders = loadOrdersFromStorage();
    }
    // Return sorted newest first
    return [...memoryOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getOrder(refOrId: string): OrderRecord | null {
    const orders = this.getOrders();
    return (
      orders.find((o) => o.orderRef === refOrId || o.id === refOrId) || null
    );
  },

  /**
   * Save ready-made purchase order with immutable snapshot
   */
  createReadyMadeOrder(payload: {
    orderRef: string;
    items: CartItem[];
    customer: OrderCustomerSnapshot;
    subtotal: number;
  }): OrderRecord {
    const existing = this.getOrder(payload.orderRef);
    if (existing) {
      return existing; // idempotent: prevent duplicate submissions
    }

    const now = new Date();
    const iso = now.toISOString();
    const formatted = formatArabicDateTime(now);

    const snapshots: ReadyMadeOrderItemSnapshot[] = payload.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      categoryName: it.categoryName,
      image: it.image,
      colorName: it.color.name,
      colorHex: it.color.hex,
      sizeLabel: it.size.label,
      widthCm: it.size.widthCm,
      heightCm: it.size.heightCm,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      itemTotal: it.unitPrice * it.quantity,
    }));

    const newOrder: OrderRecord = {
      id: `ord_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`,
      orderRef: payload.orderRef,
      type: 'ready_made',
      typeLabel: 'شراء ستائر جاهزة',
      createdAt: iso,
      createdFormatted: formatted,
      status: 'pending',
      statusLabel: 'قيد المراجعة',
      customer: { ...payload.customer },
      readyMadeItems: snapshots,
      subtotal: payload.subtotal,
      deliveryPricingNote: SHOP_CONFIG.deliveryPricingNote,
      total: payload.subtotal,
      paymentMethod: 'الدفع عند الاستلام داخل الأردن',
      paymentStatus: 'بانتظار التأكيد والاستلام',
      timeline: [
        {
          id: 'evt_created',
          title: 'تم تسجيل الطلب وحفظه محلياً',
          time: formatted,
          timestamp: iso,
          description: 'تم توثيق كافة أصناف الستائر المختارة وعنوان التسليم المسجل.',
          type: 'creation',
        },
        {
          id: 'evt_pending',
          title: 'الطلب قيد المراجعة المبدئية',
          time: formatted,
          timestamp: iso,
          description: 'طلبك بانتظار اتصال التنسيق المباشر لتحديد موعد التسليم ورسوم النقل.',
          type: 'info',
        },
      ],
    };

    const currentOrders = this.getOrders();
    persistOrders([newOrder, ...currentOrders]);
    return newOrder;
  },

  /**
   * Save custom quotation request with immutable snapshot
   */
  createCustomQuoteOrder(payload: {
    orderRef: string;
    items: CustomCurtainItem[];
    customer: OrderCustomerSnapshot;
  }): OrderRecord {
    const existing = this.getOrder(payload.orderRef);
    if (existing) {
      return existing; // idempotent
    }

    const now = new Date();
    const iso = now.toISOString();
    const formatted = formatArabicDateTime(now);

    const snapshots: CustomCurtainOrderItemSnapshot[] = payload.items.map((it) => ({
      id: it.id,
      curtainType: it.curtainType,
      fabric: it.fabric,
      color: it.color,
      customColorNote: it.customColorNote,
      widthCm: it.widthCm,
      heightCm: it.heightCm,
      quantity: it.quantity,
      roomLocation: it.roomLocation,
      itemNotes: it.itemNotes,
    }));

    const newOrder: OrderRecord = {
      id: `quote_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`,
      orderRef: payload.orderRef,
      type: 'custom_quote',
      typeLabel: 'طلب تفصيل',
      createdAt: iso,
      createdFormatted: formatted,
      status: 'pending',
      statusLabel: 'قيد المراجعة',
      customer: { ...payload.customer },
      customItems: snapshots,
      totalNote: 'بانتظار التسعير',
      timeline: [
        {
          id: 'evt_created',
          title: 'تم إرسال طلب التفصيل وحفظه محلياً',
          time: formatted,
          timestamp: iso,
          description: `تم توثيق مواصفات ${snapshots.length} قطع ستائر مخصصة بدقة المقاسات.`,
          type: 'creation',
        },
        {
          id: 'evt_pending',
          title: 'قيد دراسة واحتساب تكلفة الأمتار',
          time: formatted,
          timestamp: iso,
          description: 'يقوم الفني بحساب استهلاك الأقمشة والتشطيب تمهيداً لعرض السعر النهائي.',
          type: 'info',
        },
      ],
    };

    const currentOrders = this.getOrders();
    persistOrders([newOrder, ...currentOrders]);
    return newOrder;
  },

  /**
   * Cancel order while pending review
   */
  cancelOrder(orderRef: string): { success: boolean; order?: OrderRecord; error?: string } {
    const orders = this.getOrders();
    const targetIndex = orders.findIndex((o) => o.orderRef === orderRef || o.id === orderRef);

    if (targetIndex === -1) {
      return { success: false, error: 'الطلب غير موجود' };
    }

    const target = orders[targetIndex];
    if (target.status === 'cancelled') {
      return { success: true, order: target };
    }

    if (target.status !== 'pending') {
      return {
        success: false,
        error: 'لا يمكن إلغاء الطلب بعد اعتماده أو بدء تنفيذه وفق سياسة المتجر.',
      };
    }

    const now = new Date();
    const iso = now.toISOString();
    const formatted = formatArabicDateTime(now);

    const updatedTimeline: OrderTimelineEvent[] = [
      ...target.timeline,
      {
        id: `evt_cancel_${now.getTime()}`,
        title: 'تم إلغاء الطلب بناءً على رغبة العميل',
        time: formatted,
        timestamp: iso,
        description: 'تم تسجيل الإلغاء بنجاح وتحديث حالة السجل إلى ملغي.',
        type: 'cancellation',
      },
    ];

    const updatedOrder: OrderRecord = {
      ...target,
      status: 'cancelled',
      statusLabel: 'ملغي',
      cancelledAt: iso,
      cancelledFormatted: formatted,
      timeline: updatedTimeline,
    };

    const updatedList = [...orders];
    updatedList[targetIndex] = updatedOrder;
    persistOrders(updatedList);

    return { success: true, order: updatedOrder };
  },

  subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
