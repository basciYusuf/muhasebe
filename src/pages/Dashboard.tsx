import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UsersIcon, CurrencyDollarIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  totalCustomers: number;
  totalSales: number;
  pendingPayments: number;
  monthlyIncome: number;
  customerGrowth: number;
  salesGrowth: number;
  monthlyGrowth: number;
}

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: {
    name: string;
  } | null;
}

interface ChartData {
  date: string;
  income: number;
  expense: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalSales: 0,
    pendingPayments: 0,
    monthlyIncome: 0,
    customerGrowth: 0,
    salesGrowth: 0,
    monthlyGrowth: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      setLoading(true);

      // Toplam müşteri sayısı
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact' });

      // Son 30 gündeki müşteri artışı
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Toplam satışlar ve bekleyen ödemeler
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, status');
      const totalSales = invoices?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;
      const pendingInvoices = invoices?.filter(inv => inv.status === 'pending') || [];
      const pendingPayments = pendingInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);

      // Aylık gelir
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { data: monthlyTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'income')
        .gte('date', startOfMonth.toISOString());
      const monthlyIncome = monthlyTransactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

      // Son işlemler
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          id,
          date,
          type,
          amount,
          description,
          category:categories(name)
        `)
        .order('date', { ascending: false })
        .limit(10);

      // Grafik verisi için son 7 günlük işlemler
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const { data: chartTransactions } = await supabase
        .from('transactions')
        .select('date, type, amount')
        .gte('date', last7Days[0])
        .lte('date', last7Days[6]);

      const chartData = last7Days.map(date => {
        const dayTransactions = chartTransactions?.filter(t => t.date === date) || [];
        return {
          date: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          income: dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0),
          expense: dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0),
        };
      });

      // Büyüme oranları
      const customerGrowth = totalCustomers && newCustomers ? (newCustomers / totalCustomers) * 100 : 0;

      setStats({
        totalCustomers: totalCustomers || 0,
        totalSales,
        pendingPayments,
        monthlyIncome,
        customerGrowth,
        salesGrowth: 0,
        monthlyGrowth: 0,
      });

      // Tip dönüşümü ile transaction verilerini ayarla
      const safeTransactions = (transactions || []).map(t => {
        const categoryName = t.category && Array.isArray(t.category) && t.category[0]?.name
          ? String(t.category[0].name)
          : null;

        return {
          id: t.id,
          date: t.date,
          type: t.type as 'income' | 'expense',
          amount: t.amount,
          description: t.description,
          category: categoryName ? { name: categoryName } : null
        };
      });

      setRecentTransactions(safeTransactions);
      setChartData(chartData);
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  const statItems = [
    {
      name: 'Toplam Müşteri',
      value: stats.totalCustomers.toString(),
      change: `+${stats.customerGrowth.toFixed(1)}%`,
      path: '/customers',
      icon: UsersIcon,
      iconColor: 'text-blue-500',
    },
    {
      name: 'Toplam Satış',
      value: `₺${stats.totalSales.toLocaleString('tr-TR')}`,
      change: `+${stats.salesGrowth.toFixed(1)}%`,
      path: '/invoices',
      icon: CurrencyDollarIcon,
      iconColor: 'text-green-500',
    },
    {
      name: 'Bekleyen Ödemeler',
      value: `₺${stats.pendingPayments.toLocaleString('tr-TR')}`,
      change: `${(stats.pendingPayments > 0 ? Math.ceil(stats.pendingPayments / 1000) : 0)} adet`,
      path: '/invoices?status=pending',
      icon: ClockIcon,
      iconColor: 'text-yellow-500',
    },
    {
      name: 'Aylık Gelir',
      value: `₺${stats.monthlyIncome.toLocaleString('tr-TR')}`,
      change: `+${stats.monthlyGrowth.toFixed(1)}%`,
      path: '/transactions',
      icon: ChartBarIcon,
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6 min-h-full w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-4 text-center py-8">Yükleniyor...</div>
        ) : (
          statItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                  <dt className="ml-3 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                </div>
                <dd className="mt-3 text-3xl font-semibold text-gray-900">
                  {item.value}
                </dd>
                <dd className="mt-2 text-sm text-gray-600">
                  {item.change} <span className="text-gray-400">son 30 gün</span>
                </dd>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Gelir-Gider Grafiği */}
        <div className="bg-white shadow rounded-lg p-6 relative z-0 overflow-hidden">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Son 7 Günlük Gelir-Gider Grafiği</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`}
                />
                <Tooltip 
                  formatter={(value) => `₺${value.toLocaleString('tr-TR')}`}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  name="Gelir"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  name="Gider"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Son İşlemler */}
        <div className="bg-white shadow rounded-lg p-6 relative z-0">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Son İşlemler</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {transaction.description}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category?.name || 'Kategorisiz'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₺{transaction.amount.toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 