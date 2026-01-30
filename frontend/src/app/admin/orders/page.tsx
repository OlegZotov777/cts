'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Search, 
  Download, 
  RefreshCw,
  FileSpreadsheet,
  Check,
  Clock
} from 'lucide-react';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  id: number;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get<Order[]>('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
      // Demo data
      setOrders([
        {
          id: 1,
          user: { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', phone: '+7 999 123 4567' },
          items: [
            { id: 1, productId: 1, productName: 'Тонер HP 85A', quantity: 2, price: 850 },
            { id: 2, productId: 2, productName: 'Картридж Canon 725', quantity: 1, price: 2500 },
          ],
          totalAmount: 4200,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          user: { id: 2, name: 'Петр Петров', email: 'petr@example.com', phone: '+7 999 765 4321' },
          items: [
            { id: 3, productId: 3, productName: 'Фотобарабан HP CE314A', quantity: 1, price: 3200 },
          ],
          totalAmount: 3200,
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter orders by keyword
    loadOrders();
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setMessage({ type: 'success', text: 'Статус заказа обновлен!' });
      loadOrders();
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка обновления статуса' });
    }
  };

  const handleExportAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/excel/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setMessage({ type: 'error', text: 'Ошибка скачивания файла' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка скачивания файла' });
    }
  };

  const handleExportSingle = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/excel/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order_${orderId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setMessage({ type: 'error', text: 'Ошибка скачивания файла' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка скачивания файла' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-500';
      case 'processing':
        return 'text-blue-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Готов';
      case 'pending':
        return 'В работе';
      case 'processing':
        return 'Обрабатывается';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const filteredOrders = searchKeyword
    ? orders.filter(order => 
        order.user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        order.id.toString().includes(searchKeyword)
      )
    : orders;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
        
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

          {/* Export all */}
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Скачать все
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

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер заказа</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказчик</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата заказа</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Заказы не найдены
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <p key={item.id}>
                            <strong>{index + 1})</strong> {item.productName} ({item.quantity} шт.) {item.price * item.quantity} ₽
                          </p>
                        ))}
                        <p className="font-bold mt-2">Итого: {totalPrice} ₽</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <p>{order.user.name}</p>
                      <p className="text-gray-500">{order.user.email}</p>
                      {order.user.phone && <p className="text-gray-500">{order.user.phone}</p>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                          className="mt-2 flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                          Готов
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleExportSingle(order.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Скачать
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
