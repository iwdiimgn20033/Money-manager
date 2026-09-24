import React, { useState } from 'react';
import { WalletAccount, WalletType } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  Wallet, 
  Building2, 
  CreditCard, 
  PiggyBank, 
  Smartphone, 
  TrendingUp, 
  ArrowRightLeft, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Coins, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface WalletsHubViewProps {
  wallets: WalletAccount[];
  onUpdateWallets: (wallets: WalletAccount[]) => void;
  currencyCode: string;
  isArabic: boolean;
}

export const WalletsHubView: React.FC<WalletsHubViewProps> = ({
  wallets,
  onUpdateWallets,
  currencyCode,
  isArabic = true,
}) => {
  const isAr = isArabic;

  // New Wallet Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // New Wallet Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<WalletType>('bank');
  const [newBalance, setNewBalance] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');

  // Transfer Form State
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFee, setTransferFee] = useState('0');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Editing Balance Inline
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState('');

  // Calculations
  const totalAssets = wallets
    .filter(w => !w.isExcludedFromTotal && w.type !== 'card' && w.balance >= 0)
    .reduce((sum, w) => sum + w.balance, 0);

  const totalLiabilities = wallets
    .filter(w => !w.isExcludedFromTotal)
    .reduce((sum, w) => {
      if (w.type === 'card') {
        return sum + Math.abs(w.balance);
      }
      return sum + (w.balance < 0 ? Math.abs(w.balance) : 0);
    }, 0);

  const netWorth = totalAssets - totalLiabilities;

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'bank': return <Building2 className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'savings': return <PiggyBank className="w-5 h-5" />;
      case 'ewallet': return <Smartphone className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      case 'cash': default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getWalletTypeName = (type: WalletType) => {
    if (isAr) {
      switch (type) {
        case 'bank': return 'حساب بنكي';
        case 'card': return 'بطاقة ائتمانية';
        case 'savings': return 'خزنة ادخار';
        case 'ewallet': return 'محفظة إلكترونية';
        case 'investment': return 'محفظة استثمارية';
        case 'cash': default: return 'نقدية (كاش)';
      }
    }
    return type.toUpperCase();
  };

  // Add new wallet
  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const parsedBal = parseFloat(newBalance) || 0;
    const parsedLimit = parseFloat(newCreditLimit) || 0;

    const newWallet: WalletAccount = {
      id: `wallet-${Date.now()}`,
      name: newName.trim(),
      type: newType,
      balance: parsedBal,
      currency: currencyCode,
      color: newColor,
      iconName: newType === 'bank' ? 'Building2' : newType === 'card' ? 'CreditCard' : 'Wallet',
      institution: newInstitution.trim() || undefined,
      accountNumber: newAccountNumber.trim() || undefined,
      creditLimit: newType === 'card' ? parsedLimit : undefined,
    };

    onUpdateWallets([...wallets, newWallet]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewBalance('');
    setNewInstitution('');
    setNewAccountNumber('');
  };

  // Save Inline Balance
  const handleSaveInlineBalance = (walletId: string) => {
    const parsed = parseFloat(editBalanceVal);
    if (!isNaN(parsed)) {
      const updated = wallets.map(w => w.id === walletId ? { ...w, balance: parsed } : w);
      onUpdateWallets(updated);
    }
    setEditingWalletId(null);
  };

  // Delete Wallet
  const handleDeleteWallet = (walletId: string) => {
    if (wallets.length <= 1) return;
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذه المحفظة؟' : 'Delete this wallet?')) {
      onUpdateWallets(wallets.filter(w => w.id !== walletId));
    }
  };

  // Execute Transfer
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    const amount = parseFloat(transferAmount);
    const fee = parseFloat(transferFee) || 0;

    if (!amount || amount <= 0) {
      setTransferError(isAr ? 'يرجى إدخال مبلغ تحويل صالح' : 'Please enter valid transfer amount');
      return;
    }

    if (fromWalletId === toWalletId) {
      setTransferError(isAr ? 'لا يمكن التحويل لنفس المحفظة' : 'Cannot transfer to the same wallet');
      return;
    }

    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);

    if (!fromWallet || !toWallet) {
      setTransferError(isAr ? 'المحافظ المحددة غير موجودة' : 'Selected wallets not found');
      return;
    }

    const totalDeduction = amount + fee;

    const updated = wallets.map(w => {
      if (w.id === fromWalletId) {
        return { ...w, balance: w.balance - totalDeduction };
      }
      if (w.id === toWalletId) {
        return { ...w, balance: w.balance + amount };
      }
      return w;
    });

    onUpdateWallets(updated);
    setTransferSuccess(
      isAr 
        ? `تم تحويل ${formatCurrency(amount, currencyCode)} بنجاح من ${fromWallet.name} إلى ${toWallet.name}`
        : `Successfully transferred ${formatCurrency(amount, currencyCode)}`
    );

    setTimeout(() => {
      setIsTransferModalOpen(false);
      setTransferAmount('');
      setTransferSuccess(null);
    }, 900);
  };

  return (
    <div className="space-y-6 font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-blue-400 tracking-wider uppercase">
                {isAr ? 'مركز المحافظ والحسابات البنكية' : 'Wallets & Accounts Hub'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {isAr ? 'إدارة الأصول والنقدية متعددة الحسابات' : 'Multi-Account Liquidity & Net Worth'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {isAr 
                ? 'تتبع أرصدة الكاش، الحسابات البنكية، بطاقات الائتمان، ومحافظ الادخار مع إمكانية التحويل الفوري وتحديث الأرصدة.'
                : 'Monitor cash, bank accounts, cards, and savings vaults with instant inter-account transfers.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span>{isAr ? 'تحويل بين الحسابات' : 'Inter-Account Transfer'}</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة محفظة / حساب جديد' : 'Add New Wallet'}</span>
            </button>
          </div>
        </div>

        {/* High-level Summary Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block">{isAr ? 'إجمالي الأصول السائلة' : 'Total Liquid Assets'}</span>
            <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-1">
              {formatCurrency(totalAssets, currencyCode)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{isAr ? 'النقد، البنوك، وخزائن الادخار' : 'Cash, Banks & Vaults'}</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block">{isAr ? 'مستحقات البطاقات والالتزامات' : 'Credit & Liabilities'}</span>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 mt-1">
              {formatCurrency(totalLiabilities, currencyCode)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{isAr ? 'أرصدة البطاقات الائتمانية' : 'Credit card balances'}</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block">{isAr ? 'صافي السيولة النقدية (Net Worth)' : 'Net Liquidity'}</span>
            <div className={`text-xl sm:text-2xl font-mono font-black mt-1 ${netWorth >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {formatCurrency(netWorth, currencyCode)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{isAr ? 'الأصول مطروحاً منها الالتزامات' : 'Assets minus liabilities'}</span>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map((wallet) => {
          const isCard = wallet.type === 'card';
          const isNegative = wallet.balance < 0;

          return (
            <div 
              key={wallet.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
            >
              {/* Colored top accent bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ backgroundColor: wallet.color || '#2563eb' }}
              />

              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-2xl text-white shadow-xs"
                      style={{ backgroundColor: wallet.color || '#2563eb' }}
                    >
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">{wallet.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {getWalletTypeName(wallet.type)}
                        </span>
                        {wallet.accountNumber && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {wallet.accountNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteWallet(wallet.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Institution name if exists */}
                {wallet.institution && (
                  <div className="text-[11px] text-slate-500 font-bold mt-3">
                    🏢 {wallet.institution}
                  </div>
                )}

                {/* Balance Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{isCard ? (isAr ? 'المبلغ المستحق (الاستهلاك)' : 'Outstanding Balance') : (isAr ? 'الرصيد المتاح' : 'Available Balance')}</span>
                    <button
                      onClick={() => {
                        setEditingWalletId(wallet.id);
                        setEditBalanceVal(wallet.balance.toString());
                      }}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isAr ? 'تعديل الرصيد' : 'Edit'}</span>
                    </button>
                  </div>

                  {editingWalletId === wallet.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        step="any"
                        value={editBalanceVal}
                        onChange={(e) => setEditBalanceVal(e.target.value)}
                        className="w-full px-3 py-1.5 border border-blue-400 rounded-xl text-sm font-mono focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveInlineBalance(wallet.id)}
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingWalletId(null)}
                        className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className={`text-2xl font-mono font-black ${
                      isCard 
                        ? 'text-amber-600' 
                        : isNegative 
                        ? 'text-red-600' 
                        : 'text-slate-900'
                    }`}>
                      {formatCurrency(wallet.balance, currencyCode)}
                    </div>
                  )}

                  {/* Credit limit progress if Card */}
                  {isCard && wallet.creditLimit && wallet.creditLimit > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{isAr ? 'الحد الائتماني:' : 'Limit:'} {formatCurrency(wallet.creditLimit, currencyCode)}</span>
                        <span>{Math.min(100, Math.round((Math.abs(wallet.balance) / wallet.creditLimit) * 100))}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${Math.min(100, (Math.abs(wallet.balance) / wallet.creditLimit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isAr ? 'محدث ومتزامن' : 'Synced'}</span>
                </span>
                <button
                  onClick={() => {
                    setFromWalletId(wallet.id);
                    setIsTransferModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>{isAr ? 'تحويل منه' : 'Transfer'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADD WALLET MODAL */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-arabic">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute rtl:left-4 ltr:right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{isAr ? 'إضافة محفظة أو حساب جديد' : 'Add New Account / Wallet'}</h3>
                <span className="text-xs text-slate-500">{isAr ? 'حدد نوع الحساب والرصيد الافتتاحي' : 'Enter account details'}</span>
              </div>
            </div>

            <form onSubmit={handleAddWallet} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'اسم المحفظة / الحساب' : 'Account Name'} *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isAr ? 'مثال: حساب مصرف قطر الإسلامي' : 'e.g. Chase Checking'}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'نوع الحساب' : 'Type'}</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as WalletType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="bank">{isAr ? 'حساب بنكي' : 'Bank Account'}</option>
                    <option value="cash">{isAr ? 'كاش (نقد)' : 'Cash'}</option>
                    <option value="card">{isAr ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                    <option value="savings">{isAr ? 'خزنة ادخار' : 'Savings Vault'}</option>
                    <option value="ewallet">{isAr ? 'محفظة إلكترونية' : 'E-Wallet'}</option>
                    <option value="investment">{isAr ? 'استثمار' : 'Investment'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الرصيد الافتتاحي' : 'Opening Balance'}</label>
                  <input
                    type="number"
                    step="any"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {newType === 'bank' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'اسم البنك' : 'Bank Name'}</label>
                    <input
                      type="text"
                      value={newInstitution}
                      onChange={(e) => setNewInstitution(e.target.value)}
                      placeholder="QNB / الراجحي"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'آخر 4 أرقام' : 'Last 4 digits'}</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              )}

              {newType === 'card' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الحد الائتماني للبطاقة' : 'Credit Limit'}</label>
                  <input
                    type="number"
                    step="any"
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(e.target.value)}
                    placeholder="10000"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              )}

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'لون البطاقة' : 'Card Color'}</label>
                <div className="flex items-center gap-2">
                  {['#2563eb', '#10b981', '#7c3aed', '#f59e0b', '#0f766e', '#ef4444', '#0f172a'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md transition-all"
                >
                  {isAr ? 'حفظ المحفظة' : 'Save Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INTER-ACCOUNT TRANSFER MODAL */}
      {/* ------------------------------------------------------------- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-arabic">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute rtl:left-4 ltr:right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{isAr ? 'التحويل بين المحافظ والحسابات' : 'Inter-Account Transfer'}</h3>
                <span className="text-xs text-slate-500">{isAr ? 'نقل فوري للأموال بين حساباتك' : 'Transfer funds instantly'}</span>
              </div>
            </div>

            {transferError && (
              <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {transferSuccess && (
              <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{transferSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
              {/* From Wallet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'من الحساب (المرسل)' : 'From Account'}</label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance, currencyCode)})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Wallet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'إلى الحساب (المستقبل)' : 'To Account'}</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance, currencyCode)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'المبلغ المحول' : 'Amount'} *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'رسوم التحويل إن وجدت' : 'Transfer Fee'}</label>
                  <input
                    type="number"
                    step="any"
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'ملاحظات التحويل' : 'Notes'}</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: تغذية حساب الادخار' : 'e.g. Funding savings'}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد وتنفيذ التحويل' : 'Confirm Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
