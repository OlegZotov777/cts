'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  section: string;
  retailPrice: number;
  dealerPrice: number;
  availability: string;
  description: string;
  dollar: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentDollar, setCurrentDollar] = useState(1.0);
  const [newDollar, setNewDollar] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const limit = 50;

  useEffect(() => {
    loadProducts();
  }, [page, searchKeyword]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchKeyword) {
        params.append('search', searchKeyword);
      }

      const data = await api.get<{ products: Product[]; total: number; currentDollar: number }>(
        `/products?${params}`
      );
      setProducts(data.products);
      setTotal(data.total);
      setCurrentDollar(data.currentDollar);
    } catch (err) {
      console.error('Failed to load products', err);
      // Demo data
      setProducts([
        { id: 1, name: 'Тонер HP 85A', section: 'Тонер', retailPrice: 850, dealerPrice: 650, availability: 'В наличии', description: 'Тонер для принтеров HP', dollar: 1 },
        { id: 2, name: 'Картридж Canon 725', section: 'Картриджи к лазерным принтерам', retailPrice: 2500, dealerPrice: 1900, availability: 'В наличии', description: 'Оригинальный картридж', dollar: 1 },
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/excel/products/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Товары успешно загружены!' });
        loadProducts();
      } else {
        setMessage({ type: 'error', text: 'Ошибка загрузки файла' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка загрузки файла' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateDollar = async () => {
    const rate = parseFloat(newDollar);
    if (!newDollar || isNaN(rate) || rate <= 0) {
      setMessage({ type: 'error', text: 'Введите корректный курс доллара (положительное число)' });
      return;
    }

    try {
      await api.post('/excel/dollar-rate', { dollar: rate });
      setMessage({ type: 'success', text: 'Курс доллара успешно обновлен!' });
      setNewDollar('');
      loadProducts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка обновления курса' });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Вы уверены, что хотите удалить все товары?')) return;
    if (!confirm('Это действие необратимо. Продолжить?')) return;

    try {
      await api.delete('/excel/products');
      setMessage({ type: 'success', text: 'Все товары удалены!' });
      loadProducts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка удаления товаров' });
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Товар</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Dollar rate */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              placeholder={currentDollar.toString()}
              value={newDollar}
              onChange={(e) => setNewDollar(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUpdateDollar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Применить
            </button>
          </div>

          {/* Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-5 h-5" />
            {uploading ? 'Загрузка...' : 'Загрузить товар'}
          </button>

          {/* Delete all */}
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            Удалить все
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-4 text-sm underline"
          >
            Скрыть
          </button>
        </div>
      )}

      {/* Current dollar rate */}
      <div className="mb-4 text-sm text-gray-600">
        Текущий курс доллара: <span className="font-bold">{currentDollar}</span>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Раздел</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Розница</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дилер</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наличие</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900" style={{ minWidth: '200px' }}>
                      {product.section}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900" style={{ maxWidth: '300px' }}>
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(product.retailPrice).toFixed(2)} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(product.dealerPrice).toFixed(2)} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.availability}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500" style={{ maxWidth: '200px' }}>
                      {product.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Показано {(page - 1) * limit + 1} - {Math.min(page * limit, total)} из {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
