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
    verifySession();
    return () => {
      isMounted = false;
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

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`"${newProduct.name}" added to catalog successfully!`);
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

  const handleSaveEditedProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );
    showToast(`Updated "${updatedProduct.name}" photo and price tag successfully!`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Product and photo removed from catalog.');
  };

  const handleResetDefaultProducts = () => {
    if (window.confirm('Reset all catalog items, photos, and price tags back to the official Sati International inventory?')) {
      setProducts(INITIAL_PRODUCTS);
      showToast('Catalog restored to default products.');
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
