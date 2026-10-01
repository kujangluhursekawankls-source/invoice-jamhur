import React, { useState, useEffect } from 'react';
import { UserAccount, Invoice, Customer, Product, BusinessProfile } from './types';
import { storageService } from './services/storageService';
import { AndroidHeader } from './components/AndroidHeader';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { InvoiceListView } from './views/InvoiceListView';
import { InvoiceEditorView } from './views/InvoiceEditorView';
import { InvoicePreviewModal } from './views/InvoicePreviewModal';
import { CustomerView } from './views/CustomerView';
import { ProductView } from './views/ProductView';
import { SettingsView } from './views/SettingsView';
import { GuideModal } from './views/GuideModal';
import { AuthView } from './views/AuthView';
import { ToastProvider, useToast } from './context/ToastContext';

function MainApp() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');
  const { showToast } = useToast();

  // Multi-tenant business data
  const [profile, setProfile] = useState<BusinessProfile>(storageService.getProfile());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Navigation states & Modals
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [currentEditInvoice, setCurrentEditInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Network state
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi internet terhubung (Online)', 'success');
      storageService.syncToCloud();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Koneksi offline, data tersimpan di perangkat', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedUser = storageService.loadSession();
    if (savedUser) {
      setCurrentUser(savedUser);
      loadTenantData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadTenantData = async () => {
    setProfile(storageService.getProfile());
    setInvoices(storageService.getInvoices());
    setCustomers(storageService.getCustomers());
    setProducts(storageService.getProducts());
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    loadTenantData();
    setActiveTab('beranda');
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setIsEditingInvoice(false);
    setPreviewInvoice(null);
  };

  // ================= INVOICE HANDLERS =================

  const handleStartCreateInvoice = () => {
    setCurrentEditInvoice(null);
    setIsEditingInvoice(true);
  };

  const handleStartEditInvoice = (inv: Invoice) => {
    setCurrentEditInvoice(inv);
    setIsEditingInvoice(true);
  };

  const handleSaveInvoice = (
    invoiceData: Partial<Invoice> & { invoiceNumber: string; customerName: string }
  ) => {
    const saved = storageService.saveInvoice(invoiceData);
    setInvoices(storageService.getInvoices());
    setIsEditingInvoice(false);
    setCurrentEditInvoice(null);
    showToast(`Invoice ${saved.invoiceNumber} berhasil disimpan!`, 'success');
    setPreviewInvoice(saved);
  };

  const handleDeleteInvoice = (id: string) => {
    storageService.deleteInvoice(id);
    const updated = storageService.getInvoices();
    setInvoices(updated);
    if (previewInvoice && (previewInvoice.id === id || previewInvoice.invoiceNumber === id)) {
      setPreviewInvoice(null);
    }
    showToast('Invoice berhasil dihapus', 'success');
  };

  // Langsung buka modal review & download agar proses render 100% presisi dan tajam
  const handleDirectDownload = (inv: Invoice) => {
    setPreviewInvoice(inv);
  };

  // ================= CUSTOMER & PRODUCT HANDLERS =================

  const handleSaveCustomer = (cust: any) => {
    storageService.saveCustomer(cust);
    setCustomers(storageService.getCustomers());
  };

  const handleDeleteCustomer = (id: string) => {
    storageService.deleteCustomer(id);
    setCustomers(storageService.getCustomers());
  };

  const handleSaveProduct = (prod: any) => {
    storageService.saveProduct(prod);
    setProducts(storageService.getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    storageService.deleteProduct(id);
    setProducts(storageService.getProducts());
  };

  const handleSaveProfile = (newProfile: BusinessProfile) => {
    storageService.saveProfile(newProfile);
    setProfile(newProfile);
  };

  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-blue-600 selection:text-white">
      {/* Wrapper Handphone Android Portrait */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative shadow-2xl border-x border-slate-200/40">
        {/* Header Android */}
        <AndroidHeader
          currentUser={currentUser}
          onOpenGuide={() => setIsGuideOpen(true)}
          isOnline={isOnline}
        />

        {/* Konten Utama */}
        <main className="flex-1 overflow-x-hidden">
          {isEditingInvoice ? (
            <InvoiceEditorView
              initialInvoice={currentEditInvoice}
              customers={customers}
              products={products}
              profile={profile}
              onSave={handleSaveInvoice}
              onPreview={(tempInv) => setPreviewInvoice(tempInv)}
              onCancel={() => {
                setIsEditingInvoice(false);
                setCurrentEditInvoice(null);
              }}
            />
          ) : (
            <>
              {activeTab === 'beranda' && (
                <HomeView
                  invoices={invoices}
                  profile={profile}
                  onCreateInvoice={handleStartCreateInvoice}
                  onViewInvoice={(inv) => setPreviewInvoice(inv)}
                  onGoToInvoices={() => {
                    setActiveTab('invoice');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeTab === 'invoice' && (
                <InvoiceListView
                  invoices={invoices}
                  profile={profile}
                  onCreateInvoice={handleStartCreateInvoice}
                  onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
                  onEditInvoice={handleStartEditInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                  onDirectDownload={handleDirectDownload}
                />
              )}

              {activeTab === 'pelanggan' && (
                <CustomerView
                  customers={customers}
                  onSaveCustomer={handleSaveCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              )}

              {activeTab === 'produk' && (
                <ProductView
                  products={products}
                  onSaveProduct={handleSaveProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'pengaturan' && (
                <SettingsView
                  profile={profile}
                  currentUser={currentUser}
                  onSaveProfile={handleSaveProfile}
                  onLogout={handleLogout}
                  onOpenGuide={() => setIsGuideOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Bar Android */}
        {!isEditingInvoice && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Modal Review Dokumen & Download PDF */}
        {previewInvoice && (
          <InvoicePreviewModal
            isOpen={!!previewInvoice}
            invoice={previewInvoice}
            profile={profile}
            onClose={() => setPreviewInvoice(null)}
            onDelete={handleDeleteInvoice}
            onEdit={(inv) => {
              setPreviewInvoice(null);
              handleStartEditInvoice(inv);
            }}
          />
        )}

        {/* Modal Panduan Lengkap 19 Poin & Rilis Play Store */}
        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
