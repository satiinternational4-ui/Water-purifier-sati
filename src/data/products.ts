import { Product, ShopContact, ServiceArea } from '../types';
import defaultProducts from './products.json';

export const SHOP_CONFIG: ShopContact = {
  name: 'Sati International',
  tagline: 'Premium Water Purifiers, Genuine RO Spare Parts & Doorstep Repair Service',
  phone: '+997 9804235755',
  whatsappPhone: '+997 9804235755', // User WhatsApp direct: +997 9804235755 / +977 9804235755
  smsPhone: '9304643614', // 1-Click SMS direct number: 9304643614
  email: 'satiinternational4@gmail.com',
  address: 'Main Road, Raxaul - Birganj Border Region, Indo-Nepal Hub',
  serviceAreas: [
    'Birganj',
    'Raxaul',
    'Laxmipur Noniyadih',
    'Bettiah',
    'Motihari',
    'Sugauli',
  ],
  hours: '10:00 AM – 7:00 PM (Monday to Sunday)',
};

export const INITIAL_PRODUCTS: Product[] = defaultProducts as Product[];

