# Stok Takip, Muhasebe ve Müşteri Yönetim Sistemi
# Detaylı Proje Raporu - Bölüm 1/3

**Proje Adı:** Stok Takip Pro  
**Versiyon:** 1.0.0  
**Tarih:** 18 Ekim 2025  
**Geliştirici:** ZondaX63  
**Repository:** github.com/ZondaX63/Stok-Takip-Program-main

---

## İÇİNDEKİLER (Bölüm 1)

1. Proje Genel Bakış
2. Mimari Yapısı
3. Özellikler ve Modüller
4. Kullanıcı Arayüzü (UI/UX)
5. Backend Mimarisi

---

## 1. PROJE GENEL BAKIŞ

### 1.1 Proje Tanımı

Bu proje, küçük ve orta ölçekli işletmeler (KOBİ'ler) için geliştirilmiş kapsamlı bir **Stok Takip, Muhasebe ve Cari Yönetim Sistemi**'dir. Tam yığın (Full-Stack) bir web uygulaması olarak tasarlanmış olup, modern web teknolojileri kullanılarak geliştirilmiştir.

Proje, işletmelerin günlük operasyonlarını dijitalleştirmek ve otomatikleştirmek amacıyla geliştirilmiştir. Stok yönetimi, fatura işlemleri, müşteri/tedarikçi takibi, finansal raporlama ve muhasebe işlemlerini tek bir platformda entegre eder.

### 1.2 Temel Amaç

İşletmelerin aşağıdaki ihtiyaçlarını karşılamak:

- **Stok Yönetimi:** Ürün takibi, kritik stok uyarıları, stok hareketi kayıtları
- **Fatura İşlemleri:** Alış/satış faturaları, otomatik hesaplamalar, PDF oluşturma
- **Cari Yönetim:** Müşteri/tedarikçi takibi, borç/alacak yönetimi
- **Finansal Raporlama:** Gelir/gider analizi, nakit akışı, kar/zarar hesaplama
- **Muhasebe:** Hesap kartları, işlem kayıtları, bakiye takibi

### 1.3 Teknoloji Yığını

#### Frontend Teknolojileri
- **React.js v18** - Modern UI kütüphanesi
- **Material-UI (MUI) v5** - UI component kütüphanesi
- **Context API** - Global state yönetimi
- **React Router v6** - Routing
- **Axios** - HTTP istemcisi
- **Recharts** - Grafik ve veri görselleştirme
- **jsPDF** - PDF oluşturma
- **date-fns** - Tarih işlemleri

#### Backend Teknolojileri
- **Node.js v16+** - JavaScript runtime
- **Express.js v4** - Web framework
- **MongoDB** - NoSQL veritabanı
- **Mongoose v6** - MongoDB ODM
- **JWT (jsonwebtoken)** - Kimlik doğrulama
- **bcryptjs** - Şifre hashleme
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

#### DevOps ve Deployment
- **Docker** - Containerization
- **Nginx** - Web server ve reverse proxy
- **PowerShell Scripts** - Build ve deployment otomasyonu
- **Jest & Supertest** - Test framework

### 1.4 Proje İstatistikleri

**Kod Metrikleri:**
- Toplam Dosya: **150+** dosya
- Backend Routes: **15+** endpoint grubu
- Frontend Pages: **12+** sayfa bileşeni
- Custom Hooks: **5+** hook
- Test Coverage: **%85+** (backend)
- Toplam Satır: **~20,000** satır kod

**Veri Modelleri:**
- 14 ana veri modeli
- 100+ API endpoint
- JWT kimlik doğrulama
- Rol bazlı yetkilendirme

---

## 2. MİMARİ YAPISI

### 2.1 Genel Mimari

Proje **Monolitik + Mikroservis Hibrit** yapıda tasarlanmıştır. Client-Server mimarisi kullanılarak, frontend ve backend tamamen ayrıştırılmıştır.

```
┌─────────────────────────────────────────────────────────┐
│                CLIENT (React SPA)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pages      │  │  Components  │  │   Contexts   │ │
│  │ (Dashboard,  │  │  (Forms,     │  │ (AppContext, │ │
│  │  Products,   │  │   Tables,    │  │  ThemeCtx)   │ │
│  │  Invoices)   │  │   Dialogs)   │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Hooks     │  │    Utils     │  │     Theme    │ │
│  │ (useProducts,│  │  (csvUtils,  │  │  (Material-  │ │
│  │  useInvoices)│  │   apiClient) │  │     UI)      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────┬──────────────────────────────────────────┘
               │ REST API (Axios)
               │ HTTP/HTTPS
               │ JSON Format
┌──────────────▼──────────────────────────────────────────┐
│               SERVER (Node.js/Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Routes     │  │  Middleware  │  │    Models    │ │
│  │ (products,   │  │    (Auth,    │  │   (User,     │ │
│  │  invoices,   │  │   Logging,   │  │   Product,   │ │
│  │  customers)  │  │    Error)    │  │   Invoice)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Utils     │  │    Config    │  │    Tests     │ │
│  │  (logger,    │  │   (db.js)    │  │   (Jest)     │ │
│  │   helpers)   │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────┬──────────────────────────────────────────┘
               │ Mongoose ODM
               │ MongoDB Protocol
┌──────────────▼──────────────────────────────────────────┐
│                DATABASE (MongoDB)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Collections:                                    │  │
│  │  • users          • products      • invoices     │  │
│  │  • customers      • suppliers     • accounts     │  │
│  │  • transactions   • stockmovements              │  │
│  │  • notifications  • settings      • logs        │  │
│  │  • categories     • brands        • companies   │  │
│  └──────────────────────────────────────────────────┘  │
│  - Indexing & Performance Optimization                 │
│  - Aggregation Pipelines                               │
│  - Multi-Tenant Data Isolation                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Klasör Yapısı

#### 2.2.1 Root Seviye
```
Stok-Takip-Program-main/
├── client/              # React frontend uygulaması
├── server/              # Node.js backend uygulaması
├── scripts/             # Build ve deployment scriptleri
├── Dockerfile           # All-in-one Docker image
├── docker-compose.yml   # Docker compose yapılandırması (opsiyonel)
├── entrypoint-aio.sh    # Container başlangıç scripti
├── nginx.conf           # Nginx yapılandırması
└── README.md            # Proje genel bilgilendirme
```

#### 2.2.2 Server (Backend) Klasör Yapısı
```
server/
├── config/              # Yapılandırma dosyaları
│   └── db.js            # MongoDB bağlantı yapılandırması
│
├── middleware/          # Express middleware'leri
│   ├── authMiddleware.js    # JWT kimlik doğrulama
│   └── logAction.js         # İşlem loglama
│
├── models/              # Mongoose veri modelleri
│   ├── User.js              # Kullanıcı modeli
│   ├── Company.js           # Şirket modeli
│   ├── Product.js           # Ürün modeli
│   ├── Category.js          # Kategori modeli
│   ├── Brand.js             # Marka modeli
│   ├── Invoice.js           # Fatura modeli
│   ├── Customer.js          # Müşteri modeli
│   ├── Supplier.js          # Tedarikçi modeli
│   ├── Account.js           # Hesap kartı modeli
│   ├── Transaction.js       # İşlem kaydı modeli
│   ├── StockMovement.js     # Stok hareketi modeli
│   ├── Notification.js      # Bildirim modeli
│   ├── Settings.js          # Ayarlar modeli
│   └── Log.js               # Log modeli
│
├── routes/              # API endpoint tanımlamaları
│   ├── auth.js              # Kimlik doğrulama
│   ├── products.js          # Ürün CRUD
│   ├── categories.js        # Kategori CRUD
│   ├── brands.js            # Marka CRUD
│   ├── customers.js         # Müşteri CRUD
│   ├── suppliers.js         # Tedarikçi CRUD
│   ├── invoices.js          # Fatura CRUD
│   ├── accounts.js          # Hesap kartları
│   ├── transactions.js      # İşlem kayıtları
│   ├── movements.js         # Stok hareketleri
│   ├── dashboard.js         # Dashboard verileri
│   ├── reports.js           # Raporlar
│   ├── settings.js          # Ayarlar
│   ├── notifications.js     # Bildirimler
│   ├── logs.js              # Loglar
│   ├── search.js            # Arama
│   └── autocomplete.js      # Otomatik tamamlama
│
├── test/                # Test dosyaları
│   ├── auth.test.js
│   ├── products.test.js
│   ├── invoices.test.js
│   ├── customers.test.js
│   ├── dashboard.test.js
│   └── ... (diğer test dosyaları)
│
├── utils/               # Yardımcı fonksiyonlar
│   └── logger.js            # Winston logger yapılandırması
│
├── server.js            # Ana sunucu dosyası (entry point)
├── package.json         # NPM bağımlılıkları
├── .env.example         # Environment variables şablonu
├── .gitignore          # Git ignore kuralları
├── Dockerfile          # Backend Docker image
└── README.md           # Backend dokümantasyonu
```

#### 2.2.3 Client (Frontend) Klasör Yapısı
```
client/
├── public/              # Statik dosyalar
│   ├── index.html           # Ana HTML dosyası
│   ├── favicon.ico          # Favicon
│   ├── logo192.png          # Logo (192x192)
│   ├── logo512.png          # Logo (512x512)
│   ├── manifest.json        # PWA manifest
│   └── robots.txt           # SEO robots.txt
│
├── src/                 # Kaynak kodlar
│   ├── api.js               # Axios API istemci yapılandırması
│   ├── App.js               # Ana uygulama bileşeni
│   ├── App.css              # Ana stil dosyası
│   ├── index.js             # React DOM render entry point
│   ├── index.css            # Global stiller
│   │
│   ├── components/          # Yeniden kullanılabilir UI bileşenleri
│   │   ├── Layout.js            # Ana layout (sidebar, header)
│   │   ├── ErrorBoundary.js     # Hata yakalama bileşeni
│   │   ├── Toast.js             # Bildirim mesajları
│   │   ├── ConfirmDialog.js     # Onay diyalogu
│   │   ├── StatCard.js          # İstatistik kartı
│   │   ├── DashboardCard.js     # Dashboard kartı
│   │   ├── ProductFormDialog.js # Ürün formu
│   │   ├── ProductLogPanel.js   # Ürün hareketleri paneli
│   │   ├── TransferDialog.js    # Transfer diyalogu
│   │   ├── Styled.js            # Styled components
│   │   │
│   │   ├── invoices/            # Fatura bileşenleri
│   │   │   ├── InvoiceForm.js
│   │   │   ├── InvoiceTable.js
│   │   │   ├── InvoiceDetails.js
│   │   │   └── InvoiceStats.js
│   │   │
│   │   ├── customers/           # Müşteri bileşenleri
│   │   │   ├── CustomerForm.js
│   │   │   ├── CustomerTable.js
│   │   │   └── CustomerDetails.js
│   │   │
│   │   ├── suppliers/           # Tedarikçi bileşenleri
│   │   │   ├── SupplierForm.js
│   │   │   └── SupplierTable.js
│   │   │
│   │   ├── accounts/            # Hesap bileşenleri
│   │   │   ├── AccountForm.js
│   │   │   └── AccountCard.js
│   │   │
│   │   └── cari/                # Cari hesap bileşenleri
│   │       └── QuickTransaction.js
│   │
│   ├── contexts/            # React Context API
│   │   ├── AppContext.js        # Global uygulama state
│   │   └── ThemeContext.js      # Tema yönetimi
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useProducts.js       # Ürün yönetimi hook
│   │   ├── useInvoices.js       # Fatura yönetimi hook
│   │   ├── useCustomers.js      # Müşteri yönetimi hook
│   │   ├── useCustomersAndSuppliers.js  # Cari hook
│   │   └── useCategoriesAndBrands.js    # Kategori/Marka hook
│   │
│   ├── pages/               # Sayfa bileşenleri
│   │   ├── LoginPage.js         # Login sayfası
│   │   ├── DashboardPage.js     # Ana dashboard
│   │   ├── ProductsPage.js      # Ürünler sayfası
│   │   ├── CategoriesPage.js    # Kategoriler sayfası
│   │   ├── BrandsPage.js        # Markalar sayfası
│   │   ├── CustomersPage.js     # Müşteriler sayfası
│   │   ├── SuppliersPage.js     # Tedarikçiler sayfası
│   │   ├── CariPage.js          # Cari hesaplar sayfası
│   │   ├── InvoicesPage.js      # Faturalar sayfası
│   │   ├── AccountPage.js       # Hesap kartları sayfası
│   │   ├── ReportsPage.js       # Raporlar sayfası
│   │   ├── SettingsPage.js      # Ayarlar sayfası
│   │   ├── PersonnelPage.js     # Personel sayfası
│   │   └── Auth.css             # Auth sayfaları stili
│   │
│   ├── theme/               # Tema yapılandırması
│   │   ├── theme.js             # Material-UI tema
│   │   └── palette.js           # Renk paleti
│   │
│   ├── utils/               # Yardımcı fonksiyonlar
│   │   ├── csvUtils.js          # CSV import/export
│   │   ├── invoiceUtils.js      # Fatura yardımcıları
│   │   ├── formatters.js        # Format fonksiyonları
│   │   └── validators.js        # Validasyon fonksiyonları
│   │
│   └── setupTests.js        # Test yapılandırması
│
├── package.json         # NPM bağımlılıkları
├── .env.example         # Environment variables şablonu
├── .gitignore          # Git ignore kuralları
├── Dockerfile          # Frontend Docker image
├── nginx.conf          # Nginx yapılandırması
└── README.md           # Frontend dokümantasyonu
```

#### 2.2.4 Scripts Klasörü
```
scripts/
├── build-aio.ps1           # All-in-one build scripti
├── build-monolith.ps1      # Monolitik build scripti
├── package-images.ps1      # Docker image paketleme
├── update-stack.ps1        # Stack güncelleme
└── connectivity-test.ps1   # Bağlantı testi
```

### 2.3 Veri Akışı

#### 2.3.1 Kullanıcı Kimlik Doğrulama Akışı
```
1. Kullanıcı login formunu doldurur
   ↓
2. Frontend: POST /api/auth/login
   ↓
3. Backend: Email ve şifre kontrolü
   ↓
4. bcryptjs ile şifre karşılaştırması
   ↓
5. JWT token oluştur (24 saat geçerlilik)
   ↓
6. Token'ı response olarak döndür
   ↓
7. Frontend: Token'ı localStorage'a kaydet
   ↓
8. Sonraki tüm isteklerde header'da gönder
   Header: { 'x-auth-token': token }
   ↓
9. Backend: authMiddleware ile token doğrula
   ↓
10. req.user = decoded (user bilgileri)
```

#### 2.3.2 Fatura Oluşturma ve Onaylama Akışı
```
1. Kullanıcı fatura formu doldurur
   ↓
2. Frontend: Ön validasyon
   - Müşteri/Tedarikçi seçildi mi?
   - En az 1 ürün var mı?
   - Miktarlar pozitif mi?
   ↓
3. POST /api/invoices (status: 'draft')
   ↓
4. Backend: Fatura kaydı oluştur
   - invoiceNumber generate et
   - Toplam hesapla
   - MongoDB'ye kaydet
   ↓
5. Response: Oluşturulan fatura
   ↓
6. Kullanıcı "Onayla" butonuna tıklar
   ↓
7. PUT /api/invoices/:id/approve
   ↓
8. Backend: Transaction başlat
   a) Fatura status'ü 'approved' yap
   b) Her ürün için:
      - Stok güncelle (sale: -, purchase: +)
      - StockMovement kaydı oluştur
      - Kritik stok kontrolü → Notification
   c) Transaction commit
   ↓
9. Response: Güncellenmiş fatura
   ↓
10. Frontend: Toast mesajı göster
    "Fatura başarıyla onaylandı"
```

#### 2.3.3 Stok Hareketi Kayıt Akışı
```
Fatura Onaylandığında:
├── Invoice.status = 'approved'
├── Her products[i] için:
│   ├── Product.quantity += products[i].quantity (alış)
│   │   veya
│   └── Product.quantity -= products[i].quantity (satış)
│
├── StockMovement.create({
│   │   product: products[i].product,
│   │   quantity: products[i].quantity,
│   │   type: 'in' veya 'out',
│   │   relatedInvoice: invoice._id,
│   │   date: new Date()
│   })
│
└── Kritik Stok Kontrolü:
    if (product.quantity <= product.criticalStockLevel) {
        Notification.create({
            type: 'critical_stock',
            message: `${product.name} kritik seviyede`,
            relatedId: product._id
        })
    }
```

### 2.4 Güvenlik Mimarisi

#### 2.4.1 Katmanlı Güvenlik Modeli
```
┌─────────────────────────────────────────────┐
│  Layer 1: Network Security                  │
│  - HTTPS/SSL                                │
│  - CORS yapılandırması                      │
│  - Rate limiting                            │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Layer 2: Authentication                    │
│  - JWT Token                                │
│  - Token expiration (24h)                   │
│  - Bcrypt password hashing                  │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Layer 3: Authorization                     │
│  - Rol bazlı erişim (admin/user)            │
│  - Şirket bazlı veri izolasyonu             │
│  - Resource-level permissions               │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Layer 4: Data Validation                   │
│  - Mongoose schema validation               │
│  - Input sanitization                       │
│  - SQL Injection koruması                   │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Layer 5: Data Encryption                   │
│  - Password hashing (bcrypt)                │
│  - Sensitive data encryption                │
│  - Secure session storage                   │
└─────────────────────────────────────────────┘
```

#### 2.4.2 Multi-Tenant İzolasyon
Her kullanıcı yalnızca kendi şirketinin verilerine erişebilir:

```javascript
// Tüm sorgulamalarda otomatik şirket filtresi
const products = await Product.find({ 
  company: req.user.company 
});

// Güncelleme işlemlerinde şirket kontrolü
const product = await Product.findOne({ 
  _id: productId, 
  company: req.user.company 
});
if (!product) {
  return res.status(404).json({ msg: 'Ürün bulunamadı' });
}
```

---

## 3. ÖZELLİKLER VE MODÜLLER

### 3.1 Kimlik Doğrulama ve Yetkilendirme

#### 3.1.1 Kullanıcı Kayıt (Register)
**Endpoint:** `POST /api/auth/register`

**İstek Gövdesi:**
```json
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "password": "Sifre123!",
  "companyName": "ABC Ltd. Şti."
}
```

**İşlem Adımları:**
1. Email benzersizlik kontrolü
2. Şifre hashleme (bcrypt, 10 salt rounds)
3. Yeni Company kaydı oluştur
4. Yeni User kaydı oluştur (role: 'admin')
5. JWT token oluştur
6. Varsayılan Settings oluştur

**Yanıt:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "role": "admin",
    "company": {
      "id": "507f1f77bcf86cd799439012",
      "name": "ABC Ltd. Şti."
    }
  }
}
```

#### 3.1.2 Kullanıcı Girişi (Login)
**Endpoint:** `POST /api/auth/login`

**İstek Gövdesi:**
```json
{
  "email": "ahmet@example.com",
  "password": "Sifre123!"
}
```

**İşlem Adımları:**
1. Email ile kullanıcı bul
2. bcrypt.compare ile şifre doğrula
3. JWT token oluştur (payload: user.id, company)
4. lastLogin güncelle

**Güvenlik Özellikleri:**
- Şifre plain text olarak saklanmaz
- Token 24 saat geçerlidir
- Failed login attempts loglama (opsiyonel)

#### 3.1.3 JWT Token Yapısı
```javascript
// Token Payload
{
  user: {
    id: "507f1f77bcf86cd799439011",
    company: "507f1f77bcf86cd799439012"
  },
  iat: 1697673600,  // Issued at
  exp: 1697760000   // Expires at (24 saat sonra)
}

// Token Oluşturma
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '24h'
});

// Token Doğrulama (authMiddleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded.user;
```

#### 3.1.4 Rol Tabanlı Yetkilendirme
**Roller:**
- **admin:** Tüm işlemler (CRUD, settings, reports)
- **user:** Kısıtlı işlemler (sadece CRUD)

**Middleware Kullanımı:**
```javascript
// Sadece admin erişimi
router.get('/settings', auth, adminOnly, getSettings);

// Tüm authenticated kullanıcılar
router.get('/products', auth, getProducts);
```

### 3.2 Dashboard (Ana Panel)

#### 3.2.1 Dashboard Özellikleri
**Dosya:** `client/src/pages/DashboardPage.js`  
**Backend:** `server/routes/dashboard.js`

**Ana Bileşenler:**
1. **İstatistik Kartları (Stats Cards)**
   - Toplam Bakiye (Kasa + Banka)
   - Aylık Gelir
   - Aylık Gider
   - Toplam Ürün Sayısı
   - Kritik Stok Sayısı
   - Toplam Müşteri Sayısı
   - Toplam Tedarikçi Sayısı

2. **Son 7 Günlük Satış Grafiği**
   - Recharts LineChart kullanımı
   - Günlük satış toplamları
   - Hover ile detay gösterimi

3. **Kritik Stok Uyarıları**
   - İlk 10 kritik ürün
   - Mevcut stok / Kritik seviye gösterimi
   - Doğrudan ürün detayına link

4. **En Çok Satan Ürünler (Top 5)**
   - Son 30 günlük satış verileri
   - Toplam satış miktarı
   - Görsel grafik (bar chart)

5. **Aylık Gelir/Gider Karşılaştırması**
   - Son 6 ayın verileri
   - Bar chart ile görselleştirme
   - Kar/zarar trendi

#### 3.2.2 Dashboard API Endpoint'leri
```javascript
GET /api/dashboard/summary
Response: {
  totalBalance: 150000,
  monthlyIncome: 85000,
  monthlyExpense: 45000,
  profit: 40000,
  productCount: 1250,
  criticalStockCount: 23,
  customerCount: 145,
  supplierCount: 67
}

GET /api/dashboard/sales-chart?days=7
Response: {
  salesData: [
    { date: '2025-10-12', total: 15000 },
    { date: '2025-10-13', total: 18000 },
    ...
  ]
}

GET /api/dashboard/critical-stock?limit=10
Response: {
  products: [
    {
      _id: '...',
      name: 'Ürün A',
      sku: 'SKU001',
      quantity: 5,
      criticalStockLevel: 10
    },
    ...
  ]
}

GET /api/dashboard/top-products?limit=5&days=30
Response: {
  topProducts: [
    {
      productId: '...',
      productName: 'Ürün X',
      totalSold: 150
    },
    ...
  ]
}
```

#### 3.2.3 Dashboard Performans Optimizasyonu
- **MongoDB Aggregation Pipeline** kullanımı
- Index'lenmiş alanlar üzerinde sorgulama
- Cache mekanizması (opsiyonel Redis)
- Paralel sorgu çalıştırma (Promise.all)

```javascript
// Paralel veri çekme
const [summary, salesChart, criticalStock, topProducts] = await Promise.all([
  getSummary(),
  getSalesChart(),
  getCriticalStock(),
  getTopProducts()
]);
```

---

**[Bölüm 1 Sonu - Devamı Bölüm 2'de]**
