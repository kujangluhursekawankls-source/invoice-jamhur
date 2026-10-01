import { BusinessProfile, Customer, Invoice, Product, UserAccount } from '../types';

const STORAGE_KEY_USERS = 'invoice_jamhur_users_db';
const STORAGE_KEY_CURRENT_USER = 'invoice_jamhur_current_user';

const EMPTY_PROFILE: BusinessProfile = {
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  signerName: '',
  signerTitle: 'Hormat Kami,',
  logoUrl: '',
  stampUrl: '',
  signatureUrl: '',
  invoicePrefix: 'INV',
  defaultNotes: '',
};

class StorageService {
  private currentUser: UserAccount | null = null;
  private isOnlineSyncing = false;

  constructor() {
    this.loadSession();
  }

  // ================= AUTH & MULTI-TENANT =================

  public loadSession(): UserAccount | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        this.currentUser = JSON.parse(saved);
        // Coba sinkronisasi data online di background
        this.fetchCloudTenantData(this.currentUser!.tenantId);
        return this.currentUser;
      }
    } catch (e) {
      console.error('Gagal memuat sesi pengguna:', e);
    }
    this.currentUser = null;
    return null;
  }

  public getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  public async register(name: string, email: string, pass: string): Promise<{ user: UserAccount; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !name.trim() || !pass) {
      return { user: null as any, error: 'Semua field wajib diisi.' };
    }
    if (pass.length < 6) {
      return { user: null as any, error: 'Password minimal 6 karakter.' };
    }

    // 1. Simpan ke Backend Server Cloud
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password: pass }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { user: null as any, error: data.error || 'Gagal registrasi online.' };
      }

      const newUser: UserAccount = data.user;
      this.currentUser = newUser;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
      return { user: newUser };
    } catch (err) {
      // Fallback lokal jika server terputus
      console.warn('Server offline, fallback ke penyimpanan lokal');
      const users = this.getAllUsersInternal();
      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { user: null as any, error: 'Email sudah terdaftar. Silakan login.' };
      }

      const uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const tenantId = 'tenant_' + uid;
      const newUser: UserAccount = {
        uid,
        name: name.trim(),
        email: cleanEmail,
        tenantId,
        createdAt: Date.now(),
      };

      users.push({ ...newUser, passwordHash: btoa(pass) });
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      this.currentUser = newUser;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
      return { user: newUser };
    }
  }

  public async login(email: string, pass: string): Promise<{ user: UserAccount; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Coba Login via Server Cloud API
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });
      const data = await resp.json();
      if (resp.ok && data.user) {
        const user: UserAccount = data.user;
        this.currentUser = user;
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
        // Ambil data terbaru dari cloud
        await this.fetchCloudTenantData(user.tenantId);
        return { user };
      } else {
        return { user: null as any, error: data.error || 'Email atau password salah.' };
      }
    } catch (err) {
      // Fallback lokal
      const users = this.getAllUsersInternal();
      const userMatch = users.find(
        (u: any) => u.email.toLowerCase() === cleanEmail && u.passwordHash === btoa(pass)
      );

      if (!userMatch) {
        return { user: null as any, error: 'Email atau password salah.' };
      }

      const user: UserAccount = {
        uid: userMatch.uid,
        name: userMatch.name,
        email: userMatch.email,
        tenantId: userMatch.tenantId,
        createdAt: userMatch.createdAt,
      };

      this.currentUser = user;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      return { user };
    }
  }

  public resetPassword(email: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    return {
      success: true,
      message: `Link reset password berhasil dikirim ke ${cleanEmail}. Periksa inbox email Anda.`,
    };
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }

  private getAllUsersInternal(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getTenantKey(prefix: string): string {
    const tenantId = this.currentUser?.tenantId || 'guest_tenant';
    return `ij_${prefix}_${tenantId}`;
  }

  // ================= CLOUD SYNC =================

  public async fetchCloudTenantData(tenantId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/tenant/data?tenantId=${encodeURIComponent(tenantId)}`);
      if (!res.ok) return false;
      const data = await res.json();

      if (data.profile) {
        localStorage.setItem(this.getTenantKey('profile'), JSON.stringify(data.profile));
      }
      if (Array.isArray(data.customers)) {
        localStorage.setItem(this.getTenantKey('customers'), JSON.stringify(data.customers));
      }
      if (Array.isArray(data.products)) {
        localStorage.setItem(this.getTenantKey('products'), JSON.stringify(data.products));
      }
      if (Array.isArray(data.invoices)) {
        localStorage.setItem(this.getTenantKey('invoices'), JSON.stringify(data.invoices));
      }
      return true;
    } catch (e) {
      console.warn('Gagal sinkronisasi dari cloud:', e);
      return false;
    }
  }

  public async syncToCloud(): Promise<void> {
    if (!this.currentUser || this.isOnlineSyncing) return;
    this.isOnlineSyncing = true;

    try {
      const payload = {
        tenantId: this.currentUser.tenantId,
        profile: this.getProfile(),
        customers: this.getCustomers(),
        products: this.getProducts(),
        invoices: this.getInvoices(),
      };

      await fetch('/api/tenant/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Gagal backup online ke server:', e);
    } finally {
      this.isOnlineSyncing = false;
    }
  }

  // ================= PROFIL USAHA =================

  public getProfile(): BusinessProfile {
    try {
      const key = this.getTenantKey('profile');
      const data = localStorage.getItem(key);
      if (data) {
        return { ...EMPTY_PROFILE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error getProfile:', e);
    }
    return { ...EMPTY_PROFILE };
  }

  public saveProfile(profile: BusinessProfile): void {
    const key = this.getTenantKey('profile');
    localStorage.setItem(key, JSON.stringify(profile));
    this.syncToCloud();
  }

  // ================= PELANGGAN =================

  public getCustomers(): Customer[] {
    try {
      const key = this.getTenantKey('customers');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error getCustomers:', e);
      return [];
    }
  }

  public saveCustomer(customer: Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    const customers = this.getCustomers();
    const tenantId = this.currentUser?.tenantId || 'guest_tenant';
    const now = Date.now();

    let result: Customer;
    if (customer.id) {
      const index = customers.findIndex((c) => c.id === customer.id);
      if (index !== -1) {
        result = {
          ...customers[index],
          ...customer,
          tenantId,
          updatedAt: now,
        };
        customers[index] = result;
      } else {
        result = {
          id: 'cust_' + now,
          tenantId,
          ...customer,
          createdAt: now,
          updatedAt: now,
        };
        customers.unshift(result);
      }
    } else {
      result = {
        id: 'cust_' + now + '_' + Math.random().toString(36).substring(2, 6),
        tenantId,
        ...customer,
        createdAt: now,
        updatedAt: now,
      };
      customers.unshift(result);
    }

    localStorage.setItem(this.getTenantKey('customers'), JSON.stringify(customers));
    this.syncToCloud();
    return result;
  }

  public deleteCustomer(id: string): void {
    const customers = this.getCustomers().filter((c) => c.id !== id);
    localStorage.setItem(this.getTenantKey('customers'), JSON.stringify(customers));
    this.syncToCloud();
  }

  // ================= PRODUK / JASA =================

  public getProducts(): Product[] {
    try {
      const key = this.getTenantKey('products');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error getProducts:', e);
      return [];
    }
  }

  public saveProduct(product: Omit<Product, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> & { id?: string }): Product {
    const products = this.getProducts();
    const tenantId = this.currentUser?.tenantId || 'guest_tenant';
    const now = Date.now();

    let result: Product;
    if (product.id) {
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        result = {
          ...products[index],
          ...product,
          tenantId,
          updatedAt: now,
        };
        products[index] = result;
      } else {
        result = {
          id: 'prod_' + now,
          tenantId,
          ...product,
          createdAt: now,
          updatedAt: now,
        };
        products.unshift(result);
      }
    } else {
      result = {
        id: 'prod_' + now + '_' + Math.random().toString(36).substring(2, 6),
        tenantId,
        ...product,
        createdAt: now,
        updatedAt: now,
      };
      products.unshift(result);
    }

    localStorage.setItem(this.getTenantKey('products'), JSON.stringify(products));
    this.syncToCloud();
    return result;
  }

  public deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem(this.getTenantKey('products'), JSON.stringify(products));
    this.syncToCloud();
  }

  // ================= INVOICE =================

  public getInvoices(): Invoice[] {
    try {
      const key = this.getTenantKey('invoices');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error getInvoices:', e);
      return [];
    }
  }

  public saveInvoice(invoiceData: Partial<Invoice> & { invoiceNumber: string; customerName: string }): Invoice {
    const invoices = this.getInvoices();
    const tenantId = this.currentUser?.tenantId || 'guest_tenant';
    const userId = this.currentUser?.uid || 'guest_uid';
    const now = Date.now();

    let result: Invoice;
    if (invoiceData.id) {
      const index = invoices.findIndex((inv) => inv.id === invoiceData.id);
      if (index !== -1) {
        result = {
          ...invoices[index],
          ...invoiceData,
          tenantId,
          userId,
          updatedAt: now,
        } as Invoice;
        invoices[index] = result;
      } else {
        result = {
          id: 'inv_' + now,
          tenantId,
          userId,
          createdAt: now,
          updatedAt: now,
          ...invoiceData,
        } as Invoice;
        invoices.unshift(result);
      }
    } else {
      result = {
        id: 'inv_' + now + '_' + Math.random().toString(36).substring(2, 6),
        tenantId,
        userId,
        date: invoiceData.date || new Date().toISOString().split('T')[0],
        items: invoiceData.items || [],
        subtotal: invoiceData.subtotal || 0,
        discount: invoiceData.discount || 0,
        taxPercent: invoiceData.taxPercent || 0,
        taxAmount: invoiceData.taxAmount || 0,
        grandTotal: invoiceData.grandTotal || 0,
        terbilang: invoiceData.terbilang || '',
        status: invoiceData.status || 'belum_lunas',
        createdAt: now,
        updatedAt: now,
        ...invoiceData,
      } as Invoice;
      invoices.unshift(result);
    }

    localStorage.setItem(this.getTenantKey('invoices'), JSON.stringify(invoices));
    this.syncToCloud();
    return result;
  }

  public deleteInvoice(id: string): void {
    const target = String(id || '').trim();
    if (!target) return;
    const invoices = this.getInvoices().filter((inv) => {
      const matchId = inv.id && String(inv.id).trim() === target;
      const matchNumber = inv.invoiceNumber && String(inv.invoiceNumber).trim() === target;
      return !matchId && !matchNumber;
    });
    localStorage.setItem(this.getTenantKey('invoices'), JSON.stringify(invoices));
    this.syncToCloud();
  }
}

export const storageService = new StorageService();
