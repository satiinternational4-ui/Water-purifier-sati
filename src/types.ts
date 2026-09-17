export type ProductCategory =
  | 'all'
  | 'purifiers'
  | 'membranes'
  | 'pumps'
  | 'filters'
  | 'minerals'
  | 'fittings';

export type ServiceArea =
  | 'Birganj'
  | 'Raxaul'
  | 'Laxmipur Noniyadih'
  | 'Bettiah'
  | 'Motihari'
  | 'Sugauli'
  | 'Other / Nearby';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  specs: {
    brand?: string;
    model?: string;
    capacity?: string;
    flowRate?: string;
    voltage?: string;
    warranty?: string;
    compatibility?: string;
    material?: string;
  };
  features: string[];
  inStock: boolean;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderFormData {
  customerName: string;
  phone: string;
  altPhone?: string;
  area: ServiceArea;
  address: string;
  landmark?: string;
  notes?: string;
  paymentPreference: 'Cash on Delivery / Doorstep' | 'UPI / Online' | 'Store Pickup';
}

export interface RepairFormData {
  customerName: string;
  phone: string;
  area: ServiceArea;
  address: string;
  purifierBrand: string;
  issueType: string;
  problemDetails: string;
  urgency: 'Standard (Within 24 Hrs)' | 'Emergency / Same Day' | 'Weekend Service';
  photoDataUrl?: string;
  photoFileName?: string;
}

export interface ShopContact {
  name: string;
  tagline: string;
  phone: string;
  whatsappPhone: string;
  smsPhone: string;
  email: string;
  address: string;
  serviceAreas: ServiceArea[];
  hours: string;
}
