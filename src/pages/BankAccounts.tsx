import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { BankAccount } from '../types/database.types';
import { useNotificationStore } from '../store';

export default function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotificationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    iban: '',
    balance: '',
  });
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('bank_name');

      if (error) throw error;

      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      addNotification({
        type: 'error',
        message: 'Banka hesapları yüklenirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance),
      };

      if (editingAccount) {
        const { error } = await supabase
          .from('bank_accounts')
          .update(accountData)
          .eq('id', editingAccount.id);

        if (error) throw error;

        addNotification({
          type: 'success',
          message: 'Banka hesabı başarıyla güncellendi.',
        });
      } else {
        const { error } = await supabase
          .from('bank_accounts')
          .insert([accountData]);

        if (error) throw error;

        addNotification({
          type: 'success',
          message: 'Banka hesabı başarıyla eklendi.',
        });
      }

      setIsModalOpen(false);
      setFormData({
        bank_name: '',
        account_number: '',
        iban: '',
        balance: '',
      });
      setEditingAccount(null);
      fetchAccounts();
    } catch (error) {
      console.error('Error saving bank account:', error);
      addNotification({
        type: 'error',
        message: 'Banka hesabı kaydedilirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(account: BankAccount) {
    if (!window.confirm('Bu banka hesabını silmek istediğinizden emin misiniz?')) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', account.id);

      if (error) throw error;

      addNotification({
        type: 'success',
        message: 'Banka hesabı başarıyla silindi.',
      });
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      addNotification({
        type: 'error',
        message: 'Banka hesabı silinirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(account: BankAccount) {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      iban: account.iban,
      balance: account.balance.toString(),
    });
    setIsModalOpen(true);
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Banka Hesapları</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Yeni Hesap
        </button>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banka Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hesap No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IBAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bakiye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {account.bank_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {account.account_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{account.iban}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₺{account.balance.toLocaleString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(account)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingAccount ? 'Banka Hesabı Düzenle' : 'Yeni Banka Hesabı'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Banka Adı
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={formData.bank_name}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hesap Numarası
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({ ...formData, account_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IBAN
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bakiye
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAccount(null);
                    setFormData({
                      bank_name: '',
                      account_number: '',
                      iban: '',
                      balance: '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 