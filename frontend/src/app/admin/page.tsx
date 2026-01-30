'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardStats {
  usersCount: number;
  ordersTotal: number;
  ordersLastMonth: number;
  ordersLast24Hours: number;
  totalAllTime: number;
  totalLastMonth: number;
  totalLast24Hours: number;
  productsCount: number;
  currentDollar: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get<DashboardStats>('/admin/dashboard');
      setStats(data);
    } catch (err) {
      setError('Не удалось загрузить статистику');
      // Set demo data for display
      setStats({
        usersCount: 125,
        ordersTotal: 450,
        ordersLastMonth: 78,
        ordersLast24Hours: 12,
        totalAllTime: 1250000,
        totalLastMonth: 280000,
        totalLast24Hours: 45000,
        productsCount: 1500,
        currentDollar: 92.5,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = stats ? [
    {
      title: 'Пользователи',
      value: stats.usersCount,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Заказов за все время',
      value: stats.ordersTotal,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      title: 'Заказов за месяц',
      value: stats.ordersLastMonth,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      title: 'Заказов за 24 часа',
      value: stats.ordersLast24Hours,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      title: 'Сумма за все время',
      value: `${stats.totalAllTime.toLocaleString()} ₽`,
      icon: DollarSign,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
    {
      title: 'Сумма за месяц',
      value: `${stats.totalLastMonth.toLocaleString()} ₽`,
      icon: DollarSign,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
    {
      title: 'Сумма за 24 часа',
      value: `${stats.totalLast24Hours.toLocaleString()} ₽`,
      icon: DollarSign,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
    {
      title: 'Товаров',
      value: stats.productsCount,
      icon: Package,
      color: 'bg-orange-500',
      link: '/admin/products',
    },
  ] : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Статистика</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          {error} (показаны демо-данные)
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <a
            key={index}
            href={card.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} rounded-full p-3`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Current Dollar Rate */}
      {stats && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500 mr-4" />
            <div>
              <p className="text-gray-500 text-sm">Текущий курс доллара</p>
              <p className="text-3xl font-bold text-gray-900">{stats.currentDollar} ₽</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
