import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Filter, 
  PlusCircle, 
  Droplets,
  Wrench,
  CheckCircle2,
  KeyRound,
  LogOut
} from 'lucide-react';
import { Product, ProductCategory, ServiceArea } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onOpenAddProduct: () => void;
  selectedArea: ServiceArea | 'all';
  onSelectArea: (area: ServiceArea | 'all') => void;
  isHostMode?: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onResetDefaultProducts?: () => void;
  onOpenChangePasscode?: () => void;
  onExitHostMode?: () => void;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Products & Spares' },
  { id: 'purifiers', label: 'RO Water Purifiers' },
  { id: 'membranes', label: 'RO Membranes' },
  { id: 'pumps', label: 'Booster Pumps & Power' },
  { id: 'filters', label: 'Pre-Filters & Cartridges' },
  { id: 'minerals', label: 'Alkaline & Copper Minerals' },
  { id: 'fittings', label: 'Valves, Taps & Kits' },
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onQuickOrder,
  onViewDetails,
  onOpenAddProduct,
  selectedArea,
  onSelectArea,
  isHostMode,
  onEditProduct,
  onDeleteProduct,
  onResetDefaultProducts,
  onOpenChangePasscode,
  onExitHostMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory;
        const matchesQuery =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.specs.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.specs.model?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0; // featured default order
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="products" className="py-14 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Host Mode Indicator Bar */}
        {isHostMode && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                  Host / Owner Management Active
                </span>
                <p className="text-[11px] text-amber-200/80">
                  You can now add products with photos, edit price tags, or remove items directly from the catalog.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenAddProduct}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Product &amp; Photo</span>
              </button>

              {onOpenChangePasscode && (
                <button
                  type="button"
                  onClick={onOpenChangePasscode}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Change your 20-digit security passcode"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change Passcode</span>
                </button>
              )}

              {onResetDefaultProducts && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset catalog back to standard factory products?')) {
                      onResetDefaultProducts();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Reset Defaults
                </button>
              )}

              {onExitHostMode && (
                <button
                  type="button"
                  onClick={onExitHostMode}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Exit Host Mode"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Host Mode</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section Heading & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Droplets className="w-4 h-4" />
              <span>Genuine Inventory • Direct Shop Pricing</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Water Purifiers & Authentic Spare Parts
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              100% verified genuine parts compatible with Kent, Aquaguard, Pureit, Livpure, Eureka Forbes, and custom RO setups.
            </p>
          </div>

          {/* If host mode, show quick add button */}
          {isHostMode && (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAddProduct}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-950 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Host: Add Product &amp; Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters and Search Bar Row */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-8 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search membrane, booster pump, pre-filter candle, alkaline, 12L RO..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-800/80">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
          <span>
            Showing <strong className="text-cyan-400">{filteredProducts.length}</strong> products & spare parts
          </span>
          {selectedArea !== 'all' && (
            <span className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Filtered for delivery in <strong>{selectedArea}</strong>
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onQuickOrder={onQuickOrder}
                onViewDetails={onViewDetails}
                isHostMode={isHostMode}
                onEditProduct={onEditProduct}
                onDeleteProduct={onDeleteProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <Droplets className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
              We could not find any spare parts or purifiers matching &quot;{searchQuery}&quot;. Try adjusting your search keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
