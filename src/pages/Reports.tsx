import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

type SupabaseTransaction = {
  amount: number;
  category: {
    name: string;
  } | null;
}

type SupabaseInvoice = {
  total_amount: number;
  customer?: {
    name: string;
  } | null;
  supplier?: {
    name: string;
  } | null;
}

interface ReportData {
  // Gelir-Gider özeti
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  
  // Kategori bazlı gelirler
  incomeByCategory: {
    [key: string]: number;
  };
  
  // Kategori bazlı giderler
  expenseByCategory: {
    [key: string]: number;
  };
  
  // Müşteri analizi
  topCustomers: {
    name: string;
    total: number;
  }[];
  
  // Tedarikçi analizi
  topSuppliers: {
    name: string;
    total: number;
  }[];
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Ay başı
    endDate: new Date().toISOString().split('T')[0], // Bugün
  });
  const [reportData, setReportData] = useState<ReportData>({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    incomeByCategory: {},
    expenseByCategory: {},
    topCustomers: [],
    topSuppliers: [],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  async function fetchReportData() {
    try {
      setLoading(true);

      // Gelir işlemleri
      const { data: incomeTransactions, error: incomeError } = await supabase
        .from('transactions')
        .select(`
          amount,
          category:categories(name)
        `)
        .eq('type', 'income')
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate);

      if (incomeError) throw incomeError;

      // Gider işlemleri
      const { data: expenseTransactions, error: expenseError } = await supabase
        .from('transactions')
        .select(`
          amount,
          category:categories(name)
        `)
        .eq('type', 'expense')
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate);

      if (expenseError) throw expenseError;

      // Müşteri bazlı faturalar
      const { data: customerInvoices, error: customerError } = await supabase
        .from('invoices')
        .select(`
          total_amount,
          customer:customers(name)
        `)
        .not('customer_id', 'is', null)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate);

      if (customerError) throw customerError;

      // Tedarikçi bazlı faturalar
      const { data: supplierInvoices, error: supplierError } = await supabase
        .from('invoices')
        .select(`
          total_amount,
          supplier:suppliers(name)
        `)
        .not('supplier_id', 'is', null)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate);

      if (supplierError) throw supplierError;

      // Verileri işle
      const safeIncomeTransactions = (incomeTransactions || []) as unknown as SupabaseTransaction[];
      const safeExpenseTransactions = (expenseTransactions || []) as unknown as SupabaseTransaction[];
      const safeCustomerInvoices = (customerInvoices || []) as unknown as SupabaseInvoice[];
      const safeSupplierInvoices = (supplierInvoices || []) as unknown as SupabaseInvoice[];

      const totalIncome = safeIncomeTransactions.reduce((sum, t) => 
        sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
      
      const totalExpense = safeExpenseTransactions.reduce((sum, t) => 
        sum + (typeof t.amount === 'number' ? t.amount : 0), 0);

      // Kategori bazlı gelirler
      const incomeByCategory = safeIncomeTransactions.reduce((acc: { [key: string]: number }, t) => {
        const categoryName = t.category?.name || 'Diğer';
        acc[categoryName] = (acc[categoryName] || 0) + (typeof t.amount === 'number' ? t.amount : 0);
        return acc;
      }, {});

      // Kategori bazlı giderler
      const expenseByCategory = safeExpenseTransactions.reduce((acc: { [key: string]: number }, t) => {
        const categoryName = t.category?.name || 'Diğer';
        acc[categoryName] = (acc[categoryName] || 0) + (typeof t.amount === 'number' ? t.amount : 0);
        return acc;
      }, {});

      // En çok işlem yapılan müşteriler
      const customerTotals = safeCustomerInvoices.reduce((acc: { [key: string]: number }, inv) => {
        const customerName = inv.customer?.name || 'Bilinmeyen';
        acc[customerName] = (acc[customerName] || 0) + (typeof inv.total_amount === 'number' ? inv.total_amount : 0);
        return acc;
      }, {});

      const topCustomers = Object.entries(customerTotals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // En çok işlem yapılan tedarikçiler
      const supplierTotals = safeSupplierInvoices.reduce((acc: { [key: string]: number }, inv) => {
        const supplierName = inv.supplier?.name || 'Bilinmeyen';
        acc[supplierName] = (acc[supplierName] || 0) + (typeof inv.total_amount === 'number' ? inv.total_amount : 0);
        return acc;
      }, {});

      const topSuppliers = Object.entries(supplierTotals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setReportData({
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
        incomeByCategory,
        expenseByCategory,
        topCustomers,
        topSuppliers,
      });
    } catch (error) {
      console.error('Rapor verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Raporlar</h1>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlangıç</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bitiş</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gelir-Gider Özeti */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Gelir-Gider Özeti</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Gelir</span>
                <span className="text-green-600 font-medium">
                  ₺{reportData.totalIncome.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Gider</span>
                <span className="text-red-600 font-medium">
                  ₺{reportData.totalExpense.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Net Kazanç</span>
                  <span className={`font-medium ${reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₺{reportData.netIncome.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kategori Bazlı Gelirler */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Kategori Bazlı Gelirler</h2>
            <div className="space-y-2">
              {Object.entries(reportData.incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600">{category}</span>
                  <span className="text-gray-900">₺{amount.toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kategori Bazlı Giderler */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Kategori Bazlı Giderler</h2>
            <div className="space-y-2">
              {Object.entries(reportData.expenseByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600">{category}</span>
                  <span className="text-gray-900">₺{amount.toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* En Çok İşlem Yapılan Müşteriler */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">En Çok İşlem Yapılan Müşteriler</h2>
            <div className="space-y-2">
              {reportData.topCustomers.map((customer) => (
                <div key={customer.name} className="flex justify-between items-center">
                  <span className="text-gray-600">{customer.name}</span>
                  <span className="text-gray-900">₺{customer.total.toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* En Çok İşlem Yapılan Tedarikçiler */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">En Çok İşlem Yapılan Tedarikçiler</h2>
            <div className="space-y-2">
              {reportData.topSuppliers.map((supplier) => (
                <div key={supplier.name} className="flex justify-between items-center">
                  <span className="text-gray-600">{supplier.name}</span>
                  <span className="text-gray-900">₺{supplier.total.toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 