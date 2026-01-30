'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category, ProductsResponse } from '@/types';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, X } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, page]);

  const fetchCategories = async () => {
    try {
      const data = await api.get<Category[]>('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Use static categories as fallback
      setCategories([
        { id: 1, name: 'Тонеры', slug: 'toner', description: null, imageUrl: null, sortOrder: 0, createdAt: '', updatedAt: '' },
        { id: 2, name: 'Картриджи', slug: 'cartridges', description: null, imageUrl: null, sortOrder: 1, createdAt: '', updatedAt: '' },
        { id: 3, name: 'Фотобарабаны', slug: 'drums', description: null, imageUrl: null, sortOrder: 2, createdAt: '', updatedAt: '' },
        { id: 4, name: 'Запчасти', slug: 'parts', description: null, imageUrl: null, sortOrder: 3, createdAt: '', updatedAt: '' },
      ]);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      params.set('page', page.toString());
      params.set('limit', '20');

      const data = await api.get<ProductsResponse>(`/products?${params.toString()}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Show demo products
      setProducts(getDemoProducts());
      setTotal(getDemoProducts().length);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Каталог товаров</h1>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Найти
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Categories */}
          <aside
            className={`fixed lg:static inset-0 z-40 lg:z-auto bg-black/50 lg:bg-transparent transition-opacity ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className={`absolute lg:static right-0 top-0 h-full w-72 bg-white lg:rounded-xl shadow-lg lg:shadow-md p-6 transform transition-transform lg:transform-none ${
                isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold">Фильтры</h2>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-4 hidden lg:block">Категории</h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Все товары
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id.toString());
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id.toString()
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {isLoading ? (
                  'Загрузка...'
                ) : (
                  <>
                    Найдено <span className="font-semibold text-gray-900">{total}</span> товаров
                    {search && (
                      <span>
                        {' '}по запросу &quot;<span className="font-medium">{search}</span>&quot;
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Товары не найдены</h3>
                <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
              </div>
            )}

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Страница {page} из {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

// Demo products for when API is not available
function getDemoProducts(): Product[] {
  return [
    {
      id: 1,
      name: 'Тонер HP 85A CE285A совместимый',
      description: 'Совместимый тонер для принтеров HP LaserJet P1102, M1132, M1212nf',
      retailPrice: 850,
      dealerPrice: 650,
      availability: 'В наличии',
      imageUrl: null,
      categoryId: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 2,
      name: 'Картридж Canon 725',
      description: 'Оригинальный картридж Canon для LBP6000, LBP6020, MF3010',
      retailPrice: 2500,
      dealerPrice: 1900,
      availability: 'В наличии',
      imageUrl: null,
      categoryId: 2,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 3,
      name: 'Фотобарабан HP CE314A',
      description: 'Фотобарабан для HP Color LaserJet Pro CP1025',
      retailPrice: 3200,
      dealerPrice: 2500,
      availability: 'Под заказ',
      imageUrl: null,
      categoryId: 3,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 4,
      name: 'Тонер Samsung ML-2160',
      description: 'Совместимый тонер для Samsung ML-2160, ML-2165, SCX-3400',
      retailPrice: 750,
      dealerPrice: 580,
      availability: 'В наличии',
      imageUrl: null,
      categoryId: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 5,
      name: 'Картридж Brother TN-2335',
      description: 'Оригинальный картридж Brother для HL-L2300DR, DCP-L2500DR',
      retailPrice: 2800,
      dealerPrice: 2200,
      availability: 'В наличии',
      imageUrl: null,
      categoryId: 2,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 6,
      name: 'Ролик захвата бумаги HP',
      description: 'Ролик захвата бумаги для HP LaserJet 1010, 1012, 1015, 1020',
      retailPrice: 450,
      dealerPrice: 350,
      availability: 'В наличии',
      imageUrl: null,
      categoryId: 4,
      createdAt: '',
      updatedAt: '',
    },
  ];
}
