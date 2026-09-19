import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Wrench, 
  ShoppingCart, 
  Phone, 
  Sparkles, 
  CheckCircle2,
  MapPin,
  ArrowUp
} from 'lucide-react';
import { Product, CartItem, ServiceArea, ShopContact } from './types';
import { SHOP_CONFIG, INITIAL_PRODUCTS } from './data/products';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServiceAreaBanner } from './components/ServiceAreaBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { RepairSection } from './components/RepairSection';
import { OrderModal } from './components/OrderModal';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AddProductModal } from './components/AddProductModal';
import { EditProductModal } from './components/EditProductModal';
import { HostAuthModal } from './components/HostAuthModal';
import { ChangeHostCodeModal } from './components/ChangeHostCodeModal';
import { Footer } from './components/Footer';
import { resolveWhatsAppNumber } from './utils/dispatch';
import {
  subscribeToProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveCatalogToFirestore,
  testFirestoreConnection
} from './lib/firestoreProducts';

export default function App() {
  // Products state with localStorage backup
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sati_products_catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load local products', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Host mode security state backed by verified server session token
  const [isHostMode, setIsHostMode] = useState<boolean>(false);
  const [hostSessionToken, setHostSessionToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sati_host_session') || sessionStorage.getItem('sati_host_session');
    } catch {
      return null;
    }
  });
  const [hostAuthModalOpen, setHostAuthModalOpen] = useState(false);
  const [changeHostCodeModalOpen, setChangeHostCodeModalOpen] = useState(false);

  // Validate host session token with server on initial startup
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const token = localStorage.getItem('sati_host_session') || sessionStorage.getItem('sati_host_session');
      if (!token) {
        if (isMounted) setIsHostMode(false);
        return;
      }
      try {
        const res = await fetch('/api/verify-host-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (isMounted) {
          if (data.valid) {
            setIsHostMode(true);
            setHostSessionToken(token);
          } else {
            setIsHostMode(false);
            setHostSessionToken(null);
            localStorage.removeItem('sati_host_session');
            sessionStorage.removeItem('sati_host_session');
          }
        }
      } catch (err) {
        console.warn('Host session verification check failed:', err);
      }
    };

    const loadProductsFromMainFolder = async () => {
      const timestamp = Date.now();
      let freshProducts: Product[] | null = null;

      // 1. Try /api/products first with no-cache headers
      try {
        const res = await fetch(`/api/products?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
            freshProducts = data.products;
          }
        }
      } catch (err) {
        console.warn('Could not load products from /api/products, will try static file:', err);
      }

      // 2. Fallback to direct public folder static file /data/products.json
      if (!freshProducts) {
        try {
          const resStatic = await fetch(`/data/products.json?t=${timestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            },
          });
          if (resStatic.ok) {
            const dataStatic = await resStatic.json();
            if (isMounted && Array.isArray(dataStatic) && dataStatic.length > 0) {
              freshProducts = dataStatic;
            }
          }
        } catch (err) {
          console.warn('Could not load static /data/products.json:', err);
        }
      }

      if (isMounted && freshProducts && freshProducts.length > 0) {
        setProducts(freshProducts);
        try {
          localStorage.setItem('sati_products_catalog', JSON.stringify(freshProducts));
        } catch (e) {}
      }
    };

    verifySession();
    testFirestoreConnection();

    // 1. Subscribe to real-time Firestore database updates
    // This allows changes made from any phone or browser to show immediately to all online visitors!
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = subscribeToProducts((firestoreProducts) => {
        if (isMounted && firestoreProducts && firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
          try {
            localStorage.setItem('sati_products_catalog', JSON.stringify(firestoreProducts));
          } catch (e) {}
        }
      });
    } catch (fsErr) {
      console.warn('Firestore subscription failed, relying on server file sync:', fsErr);
    }

    // 2. Also load from server /api/products and /data/products.json as backup/initial seed
    loadProductsFromMainFolder();

    // Auto-sync catalog across all open tabs and devices every 20 seconds or when window gains focus
    const handleWindowFocus = () => {
      loadProductsFromMainFolder();
    };
    window.addEventListener('focus', handleWindowFocus);
    const syncInterval = setInterval(loadProductsFromMainFolder, 20000);

    return () => {
      isMounted = false;
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(syncInterval);
    };
  }, []);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);

  // Shop config state with localStorage and proactive stale demo placeholder purging
  const [shopConfig, setShopConfig] = useState<ShopContact>(() => {
    try {
      const saved = localStorage.getItem('sati_shop_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Force purge any old demo placeholder numbers (+91 98012 34567) from cached browser storage
        if (
          !parsed.whatsappPhone ||
          parsed.whatsappPhone.includes('98012') ||
          parsed.whatsappPhone.includes('9198012')
        ) {
          parsed.whatsappPhone = '+997 9804235755';
        }
        if (!parsed.smsPhone || parsed.smsPhone.includes('98012')) {
          parsed.smsPhone = '9304643614';
        }
        if (!parsed.email || parsed.email.includes('example.com')) {
          parsed.email = 'satiinternational4@gmail.com';
        }
        if (!parsed.hours || parsed.hours.includes('8:00 AM') || parsed.hours.includes('9:00 PM')) {
          parsed.hours = '10:00 AM – 7:00 PM (Monday to Sunday)';
        }
        return {
          ...SHOP_CONFIG,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Failed to load local shop config', e);
    }
    return SHOP_CONFIG;
  });

  // Cart state with localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sati_cart_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load local cart', e);
    }
    return [];
  });

  const [selectedArea, setSelectedArea] = useState<ServiceArea | 'all'>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderModalItems, setOrderModalItems] = useState<CartItem[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Sync products to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sati_products_catalog', JSON.stringify(products));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [products]);

  // Sync cart
  useEffect(() => {
    try {
      localStorage.setItem('sati_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.warn('Cart sync error', e);
    }
  }, [cart]);

  // Sync config
  useEffect(() => {
    try {
      localStorage.setItem('sati_shop_config', JSON.stringify(shopConfig));
    } catch (e) {
      console.warn('Config sync error', e);
    }
  }, [shopConfig]);

  // Scroll listener for back to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name.slice(0, 30)}..." to your cart!`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Instant Quick Order for a single product
  const handleQuickOrder = (product: Product) => {
    setOrderModalItems([{ product, quantity: 1 }]);
    setOrderModalOpen(true);
  };

  // Checkout whole cart
  const handleCheckoutCart = () => {
    if (cart.length === 0) return;
    setOrderModalItems(cart);
    setCartOpen(false);
    setOrderModalOpen(true);
  };

  const handleOrderSuccess = () => {
    // If order was for cart items, clear cart
    setCart([]);
    showToast('Your order details are prepared for WhatsApp/Gmail dispatch!');
  };

  // Syncs products and image assets directly to the website main folder (/public/images and /public/data/products.json)
  const syncProductsToMainFolder = async (productsToSave: Product[]) => {
    let token = hostSessionToken;
    if (!token) {
      token = localStorage.getItem('sati_host_session') || sessionStorage.getItem('sati_host_session') || 'host-mode';
      setHostSessionToken(token);
    }

    try {
      const res = await fetch('/api/save-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: productsToSave,
          token,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        try {
          localStorage.setItem('sati_products_catalog', JSON.stringify(data.products));
        } catch (e) {}

        // Sync sanitized products (with clean /images/ paths) to Cloud Firestore
        try {
          for (const item of data.products) {
            await saveProductToFirestore(item);
          }
        } catch (fsErr) {
          console.warn('Firestore sync warning:', fsErr);
        }

        return data.products;
      } else if (res.status === 401) {
        showToast('⚠️ Host session expired. Please re-enter your 20-digit passcode.');
        setHostAuthModalOpen(true);
      } else {
        showToast(`⚠️ Save warning: ${data.error || 'Server could not save to folder'}`);
      }
    } catch (err) {
      console.warn('Sync to website main folder failed:', err);
      showToast('⚠️ Network error saving to website folder. Please check server.');
    }
    return null;
  };

  const handleAddProduct = async (newProduct: Product) => {
    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    try {
      localStorage.setItem('sati_products_catalog', JSON.stringify(nextProducts));
    } catch (e) {}

    // 1. Save directly to Cloud Firestore so all online phones/devices see it instantly
    try {
      await saveProductToFirestore(newProduct);
    } catch (fsErr) {
      console.warn('Firestore cloud save failed:', fsErr);
    }

    // 2. Also save to website main folder
    const saved = await syncProductsToMainFolder(nextProducts);
    if (saved) {
      showToast(`✓ "${newProduct.name}" & photo permanently saved to Cloud & website folders!`);
    } else {
      showToast(`"${newProduct.name}" added to catalog.`);
    }
  };

  // Host Mode Security Handlers
  const handleToggleHostMode = () => {
    setHostAuthModalOpen(true);
  };

  const handleHostAuthSuccess = (token: string) => {
    setIsHostMode(true);
    setHostSessionToken(token);
    try {
      localStorage.setItem('sati_host_session', token);
    } catch (e) {
      console.warn('Host session save error', e);
    }
    setHostAuthModalOpen(false);
    showToast('Host Mode Authenticated: You now have full owner catalog privileges!');
  };

  const handleExitHostMode = () => {
    setIsHostMode(false);
    setHostSessionToken(null);
    try {
      localStorage.removeItem('sati_host_session');
      sessionStorage.removeItem('sati_host_session');
      localStorage.removeItem('sati_host_mode');
    } catch (e) {
      console.warn('Host session clear error', e);
    }
    setHostAuthModalOpen(false);
    showToast('Host Mode Disabled: Normal customer view restored.');
  };

  const handleStartEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProductModalOpen(true);
  };

  const handleSaveEditedProduct = async (updatedProduct: Product) => {
    const nextProducts = products.map((item) =>
      item.id === updatedProduct.id ? updatedProduct : item
    );
    setProducts(nextProducts);
    try {
      localStorage.setItem('sati_products_catalog', JSON.stringify(nextProducts));
    } catch (e) {}

    // 1. Update in Cloud Firestore
    try {
      await saveProductToFirestore(updatedProduct);
    } catch (fsErr) {
      console.warn('Firestore save product failed:', fsErr);
    }

    // 2. Also sync to website folder
    const saved = await syncProductsToMainFolder(nextProducts);
    if (saved) {
      showToast(`✓ "${updatedProduct.name}" updated in Cloud Firestore & website files!`);
    } else {
      showToast(`Updated "${updatedProduct.name}" photo and price tag.`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const nextProducts = products.filter((item) => item.id !== productId);
    setProducts(nextProducts);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    try {
      localStorage.setItem('sati_products_catalog', JSON.stringify(nextProducts));
    } catch (e) {}

    // 1. Delete from Cloud Firestore
    try {
      await deleteProductFromFirestore(productId);
    } catch (fsErr) {
      console.warn('Firestore delete failed:', fsErr);
    }

    // 2. Sync to website folder
    const saved = await syncProductsToMainFolder(nextProducts);
    if (saved) {
      showToast('✓ Product removed from Cloud Firestore & website folders.');
    } else {
      showToast('Product and photo removed from catalog.');
    }
  };

  const handleResetDefaultProducts = async () => {
    if (window.confirm('Reset all catalog items, photos, and price tags back to the official Sati International inventory?')) {
      setProducts(INITIAL_PRODUCTS);
      try {
        localStorage.setItem('sati_products_catalog', JSON.stringify(INITIAL_PRODUCTS));
      } catch (e) {}

      try {
        await saveCatalogToFirestore(INITIAL_PRODUCTS);
      } catch (fsErr) {
        console.warn('Firestore reset catalog failed:', fsErr);
      }

      if (hostSessionToken) {
        await syncProductsToMainFolder(INITIAL_PRODUCTS);
        showToast('Catalog restored and saved to Cloud & website main folder.');
      } else {
        showToast('Catalog restored to default products.');
      }
    }
  };

  const handleSyncToMainFolder = async () => {
    showToast('Syncing all products, photos, and prices to Cloud Firestore and website public folders...');
    try {
      await saveCatalogToFirestore(products);
    } catch (fsErr) {
      console.warn('Firestore batch sync failed:', fsErr);
    }
    const saved = await syncProductsToMainFolder(products);
    if (saved) {
      showToast('✓ All catalog items, photos, and prices saved to Cloud Firestore and public folders!');
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookRepairForArea = (area: ServiceArea) => {
    setSelectedArea(area);
    handleScrollToSection('repair');
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const directWhatsappUrl = `https://wa.me/${resolveWhatsAppNumber(shopConfig.whatsappPhone)}?text=${encodeURIComponent(
    `Hello Sati International! I am contacting you for water purifier spare parts & doorstep service in ${selectedArea !== 'all' ? selectedArea : 'Birganj/Raxaul/Motihari/Bettiah/Sugauli'}.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 p-4 rounded-2xl bg-cyan-950 border border-cyan-500/60 text-cyan-200 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Nav */}
      <Header
        shopConfig={shopConfig}
        onUpdateShopConfig={setShopConfig}
        cartCount={cartTotalCount}
        onOpenCart={() => setCartOpen(true)}
        onScrollToSection={handleScrollToSection}
        onOpenAddProduct={() => setAddProductOpen(true)}
        selectedArea={selectedArea}
        onSelectAreaFilter={setSelectedArea}
        isHostMode={isHostMode}
        onToggleHostMode={handleToggleHostMode}
      />

      {/* Hero Section */}
      <Hero
        shopConfig={shopConfig}
        onScrollToSection={handleScrollToSection}
      />

      {/* Doorstep Service Area Network Banner */}
      <ServiceAreaBanner
        serviceAreas={shopConfig.serviceAreas}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        onBookRepairForArea={handleBookRepairForArea}
      />

      {/* Products & Spare Parts Catalog */}
      <ProductCatalog
        products={products}
        onAddToCart={handleAddToCart}
        onQuickOrder={handleQuickOrder}
        onViewDetails={setDetailProduct}
        onOpenAddProduct={() => setAddProductOpen(true)}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        isHostMode={isHostMode}
        onEditProduct={handleStartEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetDefaultProducts={handleResetDefaultProducts}
        onOpenChangePasscode={() => setChangeHostCodeModalOpen(true)}
        onExitHostMode={handleExitHostMode}
        onSyncToMainFolder={handleSyncToMainFolder}
      />

      {/* Dedicated Separate Repair Section with Photo Upload & 1-Click Dispatch */}
      <RepairSection
        shopConfig={shopConfig}
        initialArea={selectedArea !== 'all' ? selectedArea : undefined}
      />

      {/* Footer */}
      <Footer
        shopConfig={shopConfig}
        onScrollToSection={handleScrollToSection}
        isHostMode={isHostMode}
        onToggleHostMode={handleToggleHostMode}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckoutCart}
      />

      {/* Order Modal (1-Click WhatsApp & Gmail) */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        items={orderModalItems}
        shopConfig={shopConfig}
        initialArea={selectedArea !== 'all' ? selectedArea : undefined}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onQuickOrder={handleQuickOrder}
      />

      {/* Add Custom Product Modal */}
      <AddProductModal
        isOpen={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onAddProduct={handleAddProduct}
        sessionToken={hostSessionToken}
      />

      {/* Host Edit Product Modal (Image & Price Tag Management) */}
      <EditProductModal
        isOpen={editProductModalOpen}
        product={editingProduct}
        onClose={() => {
          setEditProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSaveProduct={handleSaveEditedProduct}
        onDeleteProduct={handleDeleteProduct}
        sessionToken={hostSessionToken}
      />

      {/* 20-Digit Host Security Authentication Modal */}
      <HostAuthModal
        isOpen={hostAuthModalOpen}
        onClose={() => setHostAuthModalOpen(false)}
        onSuccess={handleHostAuthSuccess}
        currentIsHost={isHostMode}
        onExitHostMode={handleExitHostMode}
      />

      {/* Change 20-Digit Host Passcode Modal */}
      <ChangeHostCodeModal
        isOpen={changeHostCodeModalOpen}
        onClose={() => setChangeHostCodeModalOpen(false)}
        sessionToken={hostSessionToken}
        onSuccess={() => {
          showToast('20-Digit security passcode successfully updated on the server!');
        }}
      />

      {/* Floating Action Quick Access (WhatsApp & Repair & Back to Top) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition-all hover:scale-110 cursor-pointer"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleScrollToSection('repair')}
          className="p-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer group"
          title="Book Doorstep Purifier Repair"
        >
          <Wrench className="w-5 h-5 text-slate-950 group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-extrabold hidden sm:inline">Book Repair</span>
        </button>

        <a
          href={directWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          title="Chat on WhatsApp"
        >
          <MessageSquare className="w-5 h-5 fill-slate-950" />
          <span className="text-xs font-extrabold hidden sm:inline">1-Click WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
