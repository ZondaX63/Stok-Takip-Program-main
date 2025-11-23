# Stok Takip, Muhasebe ve Müşteri Yönetim Sistemi
# Detaylı Proje Raporu - Bölüm 2/3

**Önceki Bölüm:** [PROJE_RAPORU_BOLUM_1.md](PROJE_RAPORU_BOLUM_1.md)  
**Sonraki Bölüm:** [PROJE_RAPORU_BOLUM_3.md](PROJE_RAPORU_BOLUM_3.md)

---

## İÇİNDEKİLER (Bölüm 2)

3. Özellikler ve Modüller (Devam)
   - 3.3 Ürün Yönetimi
   - 3.4 Fatura Yönetimi
   - 3.5 Cari Hesap Yönetimi
   - 3.6 Hesap ve Finans Yönetimi
   - 3.7 Raporlama Sistemi
   - 3.8 Ayarlar ve Yapılandırma

---

### 3.3 Ürün Yönetimi

#### 3.3.1 Ürün Veri Modeli
**Dosya:** `server/models/Product.js`

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  barcode: String,
  oem: String,              // OEM numarası (Otomotiv parçaları için)
  manufacturerCode: String,  // Üretici kodu
  manufacturer: String,      // Üretici firma
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  
  quantity: {
    type: Number,
    default: 0
  },
  criticalStockLevel: {
    type: Number,
    default: 10
  },
  
  purchasePrice: {
    type: Number,
    default: 0
  },
  salePrice: {
    type: Number,
    default: 0
  },
  
  unit: {
    type: String,
    default: 'Adet',
    enum: ['Adet', 'Kg', 'Litre', 'Metre', 'Paket', 'Kutu']
  },
  
  trackStock: {
    type: Boolean,
    default: true
  },
  
  description: String,
  notes: String,
  
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### 3.3.2 Ürün CRUD İşlemleri

**1. Ürün Listesi (Pagination + Filter + Sort)**
```javascript
GET /api/products?page=1&limit=20&search=abc&category=xyz&lowStock=true&sort=-createdAt

Query Parameters:
- page: Sayfa numarası (default: 1)
- limit: Sayfa başına kayıt (default: 20)
- search: Arama terimi (name, sku, barcode, oem)
- category: Kategori filtresi
- brand: Marka filtresi
- lowStock: Kritik stok filtresi (boolean)
- minStock, maxStock: Stok aralığı
- minPrice, maxPrice: Fiyat aralığı
- sort: Sıralama (-createdAt: yeni→eski, name: A→Z)

Response: {
  products: [...],
  pagination: {
    currentPage: 1,
    totalPages: 15,
    totalProducts: 287,
    hasNextPage: true,
    hasPrevPage: false
  }
}
```

**2. Ürün Oluşturma**
```javascript
POST /api/products

Request Body: {
  name: "Yağ Filtresi",
  sku: "YF-001",
  barcode: "1234567890123",
  oem: "15400-RTA-003",
  manufacturer: "Honda",
  category: "507f1f77bcf86cd799439011",
  brand: "507f1f77bcf86cd799439012",
  quantity: 50,
  criticalStockLevel: 10,
  purchasePrice: 25.50,
  salePrice: 45.00,
  unit: "Adet",
  trackStock: true
}

Response: {
  _id: "...",
  name: "Yağ Filtresi",
  sku: "YF-001",
  ...
}
```

**3. Ürün Güncelleme**
```javascript
PUT /api/products/:id

Request Body: {
  quantity: 75,
  salePrice: 48.00
}

Response: {
  _id: "...",
  quantity: 75,
  salePrice: 48.00,
  updatedAt: "2025-10-18T12:30:00.000Z"
}
```

**4. Ürün Silme (Soft Delete)**
```javascript
DELETE /api/products/:id

// Ürünü silmeden önce kontroller:
// - Bu ürün herhangi bir faturada kullanılıyor mu?
// - Stok hareketi var mı?
// Eğer varsa, uyarı ver veya silme işlemini engelle

Response: {
  msg: "Ürün başarıyla silindi"
}
```

#### 3.3.3 Gelişmiş Arama Özellikleri

**1. Çoklu Alan Araması**
```javascript
GET /api/products/search?q=honda

// Aranacak alanlar:
// - name (ürün adı)
// - sku (stok kodu)
// - barcode (barkod)
// - oem (OEM numarası)
// - manufacturerCode (üretici kodu)
// - manufacturer (üretici firma)

// Regex kullanımı (case-insensitive)
const searchRegex = new RegExp(searchTerm, 'i');
const query = {
  $or: [
    { name: searchRegex },
    { sku: searchRegex },
    { barcode: searchRegex },
    { oem: searchRegex },
    { manufacturerCode: searchRegex },
    { manufacturer: searchRegex }
  ]
};
```

**2. OEM Grup Araması**
```javascript
GET /api/products/oem-group?oem=15400*

// "15400" ile başlayan tüm OEM numaralarını bul
// Otomotiv parçaları için alternatif ürünleri gösterir

const oemPattern = searchTerm.replace('*', '.*');
const products = await Product.find({
  oem: new RegExp(`^${oemPattern}`, 'i'),
  company: req.user.company
});

Response: {
  products: [
    { name: "Ürün A", oem: "15400-RTA-003" },
    { name: "Ürün B", oem: "15400-RTA-004" },
    { name: "Ürün C", oem: "15400-PLM-A01" }
  ]
}
```

**3. Autocomplete (Otomatik Tamamlama)**
```javascript
GET /api/autocomplete/products?q=yag&limit=10

// Hızlı arama için (type-ahead)
// Sadece name ve sku döndürür (lightweight)

Response: {
  suggestions: [
    { _id: "...", name: "Yağ Filtresi", sku: "YF-001" },
    { _id: "...", name: "Motor Yağı 5W30", sku: "MY-530" }
  ]
}
```

#### 3.3.4 CSV Import/Export

**1. Ürün Export (CSV)**
```javascript
GET /api/products/export

// Tüm ürünleri CSV formatında indir
// UTF-8 BOM ile Türkçe karakter desteği
// Excel'de doğru açılır

CSV Format:
SKU,İsim,Barkod,OEM,Kategori,Marka,Stok,Kritik Seviye,Alış Fiyatı,Satış Fiyatı,Birim
YF-001,Yağ Filtresi,1234567890123,15400-RTA-003,Filtreler,Honda,50,10,25.50,45.00,Adet
```

**2. Ürün Import (CSV)**
```javascript
POST /api/products/import
Content-Type: multipart/form-data

// FormData ile CSV dosyası yükle
// SKU'ya göre eşleştirme:
//   - SKU varsa: Güncelle
//   - SKU yoksa: Yeni kayıt oluştur

Response: {
  success: true,
  imported: 45,
  updated: 12,
  failed: 3,
  errors: [
    { row: 5, error: "SKU zorunludur" },
    { row: 12, error: "Geçersiz fiyat" }
  ]
}
```

**3. Mobil Stok Sayımı Import**
```javascript
POST /api/products/import-stock-count

// Mobil uygulamadan gelen CSV:
// SKU,Sayılan_Miktar
// YF-001,48
// MY-530,75

// İşlem adımları:
// 1. SKU ile ürünü bul
// 2. Mevcut stok ile sayılan miktarı karşılaştır
// 3. Farkı hesapla
// 4. Stok güncelle
// 5. StockMovement kaydı oluştur (type: 'adjustment')

Response: {
  processed: 120,
  updated: 118,
  notFound: 2,
  differences: [
    { sku: "YF-001", oldQty: 50, newQty: 48, diff: -2 }
  ]
}
```

#### 3.3.5 Stok Hareketi Takibi

**StockMovement Model:**
```javascript
{
  product: ObjectId,           // Ürün referansı
  quantity: Number,            // Hareket miktarı
  type: String,                // 'in' (giriş), 'out' (çıkış), 'adjustment' (düzeltme)
  relatedInvoice: ObjectId,    // İlgili fatura (varsa)
  notes: String,               // Açıklama
  date: Date,                  // Hareket tarihi
  company: ObjectId,
  createdBy: ObjectId          // İşlemi yapan kullanıcı
}
```

**Stok Hareketi Listeleme:**
```javascript
GET /api/movements?product=xxx&startDate=2025-10-01&endDate=2025-10-31

Response: {
  movements: [
    {
      _id: "...",
      product: { name: "Yağ Filtresi", sku: "YF-001" },
      quantity: 20,
      type: "in",
      relatedInvoice: { invoiceNumber: "ALF-2025-001" },
      date: "2025-10-15T10:00:00.000Z"
    },
    {
      _id: "...",
      product: { name: "Yağ Filtresi", sku: "YF-001" },
      quantity: 5,
      type: "out",
      relatedInvoice: { invoiceNumber: "STF-2025-045" },
      date: "2025-10-16T14:30:00.000Z"
    }
  ]
}
```

#### 3.3.6 Kritik Stok Yönetimi

**Kritik Stok Kontrolü:**
```javascript
// Stok güncelleme sonrası otomatik kontrol
if (product.quantity <= product.criticalStockLevel) {
  // Bildirim oluştur
  await Notification.create({
    type: 'critical_stock',
    title: 'Kritik Stok Uyarısı',
    message: `${product.name} ürünü kritik stok seviyesinde (${product.quantity} ${product.unit})`,
    relatedModel: 'Product',
    relatedId: product._id,
    company: req.user.company
  });
  
  // Email gönder (opsiyonel)
  sendEmailNotification(product);
}
```

**Kritik Stok Raporu:**
```javascript
GET /api/products/critical-stock

Response: {
  products: [
    {
      name: "Yağ Filtresi",
      sku: "YF-001",
      quantity: 8,
      criticalStockLevel: 10,
      difference: -2,
      lastMovement: "2025-10-17T09:00:00.000Z"
    }
  ],
  totalCount: 23
}
```

---

### 3.4 Fatura Yönetimi

#### 3.4.1 Fatura Veri Modeli
**Dosya:** `server/models/Invoice.js`

```javascript
{
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sale'],  // 'purchase': Alış, 'sale': Satış
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid', 'canceled'],
    default: 'draft'
  },
  
  customerOrSupplier: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'partnerModel'  // Dynamic reference
  },
  partnerModel: {
    type: String,
    required: true,
    enum: ['Customer', 'Supplier']
  },
  
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01
    },
    price: Number,              // Satır fiyatı
    purchasePrice: Number,      // Alış fiyatı (kar hesabı için)
    salePrice: Number,          // Satış fiyatı
    
    // 4 kademeli iskonto sistemi
    discount1: { type: Number, default: 0, min: 0, max: 100 },
    discount2: { type: Number, default: 0, min: 0, max: 100 },
    discount3: { type: Number, default: 0, min: 0, max: 100 },
    discount4: { type: Number, default: 0, min: 0, max: 100 },
    
    vat: { type: Number, default: 20 },  // KDV oranı (%)
    
    // Hesaplanan değerler
    subtotal: Number,           // Ara toplam (iskonto öncesi)
    discountAmount: Number,     // Toplam iskonto tutarı
    netAmount: Number,          // Net tutar (iskonto sonrası)
    vatAmount: Number,          // KDV tutarı
    total: Number               // Satır toplamı (KDV dahil)
  }],
  
  // Fatura toplamları
  subtotal: Number,             // Genel ara toplam
  totalDiscount: Number,        // Toplam iskonto
  totalVat: Number,             // Toplam KDV
  totalAmount: Number,          // Genel toplam
  
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: Number,      // Kalan borç
  
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,                // Vade tarihi
  
  description: String,
  notes: String,
  
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### 3.4.2 Fatura Numarası Oluşturma

**Otomatik Fatura Numarası:**
```javascript
// Format: [TIP]-[YIL]-[SIRA]
// Örnek: STF-2025-001 (Satış Faturası)
// Örnek: ALF-2025-001 (Alış Faturası)

async function generateInvoiceNumber(type, company) {
  const prefix = type === 'sale' ? 'STF' : 'ALF';
  const year = new Date().getFullYear();
  
  // Bu yıl bu tip faturadan kaç tane var?
  const count = await Invoice.countDocuments({
    company,
    type,
    invoiceNumber: new RegExp(`^${prefix}-${year}-`)
  });
  
  const sequence = (count + 1).toString().padStart(3, '0');
  return `${prefix}-${year}-${sequence}`;
}

// Kullanım:
const invoiceNumber = await generateInvoiceNumber('sale', req.user.company);
// Output: "STF-2025-001"
```

#### 3.4.3 İskonto ve KDV Hesaplama

**4 Kademeli İskonto Sistemi:**
```javascript
function calculateProductLine(product) {
  const { quantity, price, discount1, discount2, discount3, discount4, vat } = product;
  
  // Ara toplam (iskonto öncesi)
  const subtotal = quantity * price;
  
  // 1. İskonto
  const disc1Amount = subtotal * (discount1 / 100);
  let remaining = subtotal - disc1Amount;
  
  // 2. İskonto (kalan tutar üzerinden)
  const disc2Amount = remaining * (discount2 / 100);
  remaining -= disc2Amount;
  
  // 3. İskonto
  const disc3Amount = remaining * (discount3 / 100);
  remaining -= disc3Amount;
  
  // 4. İskonto
  const disc4Amount = remaining * (discount4 / 100);
  remaining -= disc4Amount;
  
  // Toplam iskonto
  const discountAmount = disc1Amount + disc2Amount + disc3Amount + disc4Amount;
  
  // Net tutar (iskonto sonrası)
  const netAmount = remaining;
  
  // KDV hesaplama
  const vatAmount = netAmount * (vat / 100);
  
  // Satır toplamı (KDV dahil)
  const total = netAmount + vatAmount;
  
  return {
    subtotal: subtotal.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    netAmount: netAmount.toFixed(2),
    vatAmount: vatAmount.toFixed(2),
    total: total.toFixed(2)
  };
}

// Örnek:
// Fiyat: 100 TL, Miktar: 10
// İskonto1: %10, İskonto2: %5, İskonto3: %2, KDV: %20
// 
// Subtotal: 1000 TL
// Disc1: 1000 * 0.10 = 100 TL → Kalan: 900 TL
// Disc2: 900 * 0.05 = 45 TL → Kalan: 855 TL
// Disc3: 855 * 0.02 = 17.1 TL → Kalan: 837.9 TL
// Net: 837.9 TL
// KDV: 837.9 * 0.20 = 167.58 TL
// Total: 1005.48 TL
```

**Fatura Genel Toplamı:**
```javascript
function calculateInvoiceTotal(products) {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalVat = 0;
  let totalAmount = 0;
  
  products.forEach(product => {
    const calc = calculateProductLine(product);
    subtotal += parseFloat(calc.subtotal);
    totalDiscount += parseFloat(calc.discountAmount);
    totalVat += parseFloat(calc.vatAmount);
    totalAmount += parseFloat(calc.total);
  });
  
  return {
    subtotal: subtotal.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    totalVat: totalVat.toFixed(2),
    totalAmount: totalAmount.toFixed(2)
  };
}
```

#### 3.4.4 Fatura Durum Yönetimi

**Durum Akışı:**
```
draft (Taslak)
    ↓
    │ Onay: /api/invoices/:id/approve
    ↓
approved (Onaylı)
    ↓
    │ Ödeme: /api/invoices/:id/pay
    ↓
paid (Ödendi)

    ↕ (Her aşamadan iptal edilebilir)
    
canceled (İptal)
```

**1. Fatura Onaylama**
```javascript
PUT /api/invoices/:id/approve

// İşlem adımları:
async function approveInvoice(invoiceId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Fatura'yı bul
    const invoice = await Invoice.findById(invoiceId).session(session);
    
    // 2. Status kontrolü
    if (invoice.status !== 'draft') {
      throw new Error('Sadece taslak faturalar onaylanabilir');
    }
    
    // 3. Stok güncellemeleri
    for (const item of invoice.products) {
      const product = await Product.findById(item.product).session(session);
      
      if (invoice.type === 'sale') {
        // Satış: Stok düş
        if (product.trackStock && product.quantity < item.quantity) {
          throw new Error(`${product.name} için yeterli stok yok`);
        }
        product.quantity -= item.quantity;
      } else {
        // Alış: Stok artır
        product.quantity += item.quantity;
      }
      
      await product.save({ session });
      
      // 4. StockMovement kaydı
      await StockMovement.create([{
        product: product._id,
        quantity: item.quantity,
        type: invoice.type === 'sale' ? 'out' : 'in',
        relatedInvoice: invoice._id,
        date: invoice.date,
        company: invoice.company
      }], { session });
      
      // 5. Kritik stok kontrolü
      if (product.quantity <= product.criticalStockLevel) {
        await Notification.create([{
          type: 'critical_stock',
          message: `${product.name} kritik stok seviyesinde`,
          relatedModel: 'Product',
          relatedId: product._id,
          company: invoice.company
        }], { session });
      }
    }
    
    // 6. Fatura status güncelle
    invoice.status = 'approved';
    invoice.updatedAt = new Date();
    await invoice.save({ session });
    
    // 7. Log kaydı
    await Log.create([{
      action: 'invoice_approved',
      description: `${invoice.invoiceNumber} numaralı fatura onaylandı`,
      user: userId,
      relatedModel: 'Invoice',
      relatedId: invoice._id,
      company: invoice.company
    }], { session });
    
    await session.commitTransaction();
    return invoice;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

**2. Fatura Ödeme**
```javascript
PUT /api/invoices/:id/pay

Request Body: {
  amount: 1500.00,
  paymentMethod: "cash",  // cash, bank, credit_card
  account: "507f1f77bcf86cd799439011",  // Hesap kartı ID
  date: "2025-10-18",
  notes: "Nakit tahsilat"
}

// İşlem adımları:
// 1. Fatura status'ü 'paid' yap
// 2. paidAmount güncelle
// 3. remainingAmount hesapla
// 4. Transaction kaydı oluştur
// 5. Account bakiyesini güncelle
// 6. Müşteri/Tedarikçi bakiyesini güncelle

Response: {
  invoice: { ... },
  transaction: { ... }
}
```

**3. Fatura İptali**
```javascript
PUT /api/invoices/:id/cancel

// İşlem adımları:
// 1. Eğer status='approved' ise stokları geri al
// 2. StockMovement tersini oluştur
// 3. Status'ü 'canceled' yap
// 4. İlgili Transaction'ları iptal et

Response: {
  msg: "Fatura iptal edildi"
}
```

#### 3.4.5 Fatura Raporları

**1. Fatura Listesi (Filtreleme)**
```javascript
GET /api/invoices?type=sale&status=approved&startDate=2025-10-01&endDate=2025-10-31&partner=xyz

Query Parameters:
- type: purchase | sale
- status: draft | approved | paid | canceled
- startDate, endDate: Tarih aralığı
- partner: Müşteri/Tedarikçi ID
- minAmount, maxAmount: Tutar aralığı

Response: {
  invoices: [...],
  stats: {
    totalAmount: 125000,
    paidAmount: 95000,
    remainingAmount: 30000,
    count: 47
  }
}
```

**2. Fatura Detayı**
```javascript
GET /api/invoices/:id

Response: {
  _id: "...",
  invoiceNumber: "STF-2025-045",
  type: "sale",
  status: "approved",
  customerOrSupplier: {
    name: "ABC Müşteri",
    taxNumber: "1234567890"
  },
  products: [
    {
      product: {
        name: "Yağ Filtresi",
        sku: "YF-001"
      },
      quantity: 10,
      price: 45.00,
      vat: 20,
      total: 540.00
    }
  ],
  totalAmount: 540.00,
  paidAmount: 0,
  remainingAmount: 540.00,
  date: "2025-10-18T10:00:00.000Z"
}
```

**3. PDF Oluşturma**
```javascript
// Frontend: client/src/utils/invoiceUtils.js

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePdf = (invoice, company) => {
  const doc = new jsPDF();
  
  // Başlık
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURA', 105, 20, { align: 'center' });
  
  // Şirket bilgileri (sol)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(company.name, 20, 40);
  doc.text(company.address, 20, 45);
  doc.text(`Tel: ${company.phone}`, 20, 50);
  doc.text(`Vergi No: ${company.taxNumber}`, 20, 55);
  
  // Fatura bilgileri (sağ)
  doc.text(`Fatura No: ${invoice.invoiceNumber}`, 140, 40);
  doc.text(`Tarih: ${formatDate(invoice.date)}`, 140, 45);
  doc.text(`Vade: ${formatDate(invoice.dueDate)}`, 140, 50);
  
  // Müşteri/Tedarikçi bilgileri
  doc.text('Müşteri:', 20, 70);
  doc.text(invoice.customerOrSupplier.name, 20, 75);
  doc.text(invoice.customerOrSupplier.address || '', 20, 80);
  
  // Ürün tablosu
  const tableData = invoice.products.map(p => [
    p.product.name,
    p.quantity,
    formatCurrency(p.price),
    `%${p.vat}`,
    formatCurrency(p.total)
  ]);
  
  doc.autoTable({
    startY: 90,
    head: [['Ürün', 'Miktar', 'Birim Fiyat', 'KDV', 'Toplam']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] }
  });
  
  // Toplamlar
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Ara Toplam: ${formatCurrency(invoice.subtotal)}`, 140, finalY);
  doc.text(`KDV: ${formatCurrency(invoice.totalVat)}`, 140, finalY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`GENEL TOPLAM: ${formatCurrency(invoice.totalAmount)}`, 140, finalY + 10);
  
  // Kaydet
  doc.save(`fatura_${invoice.invoiceNumber}.pdf`);
};
```

---

### 3.5 Cari Hesap Yönetimi

#### 3.5.1 Müşteri (Customer) Modeli
**Dosya:** `server/models/Customer.js`

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    uppercase: true
  },
  
  // İletişim bilgileri
  email: String,
  phone: String,
  mobile: String,
  fax: String,
  website: String,
  
  // Adres bilgileri
  address: String,
  city: String,
  district: String,
  country: { type: String, default: 'Türkiye' },
  postalCode: String,
  
  // Vergi bilgileri
  taxNumber: String,
  taxOffice: String,
  
  // Finansal bilgiler
  balance: {
    type: Number,
    default: 0
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  paymentTerm: {
    type: Number,
    default: 30  // Gün
  },
  
  // Ek bilgiler
  notes: String,
  tags: [String],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### 3.5.2 Müşteri İşlemleri

**1. Müşteri Oluşturma**
```javascript
POST /api/customers

Request Body: {
  name: "ABC Müşteri Ltd.",
  email: "info@abcmusteri.com",
  phone: "+90 212 123 45 67",
  address: "Atatürk Cad. No:123",
  city: "İstanbul",
  taxNumber: "1234567890",
  taxOffice: "Kadıköy",
  creditLimit: 50000,
  paymentTerm: 30
}

Response: {
  _id: "...",
  code: "MUS-001",  // Otomatik oluşturulan kod
  name: "ABC Müşteri Ltd.",
  balance: 0,
  ...
}
```

**2. Müşteri Detay Sayfası**
```javascript
GET /api/customers/:id/details

Response: {
  customer: { ... },
  statistics: {
    totalPurchases: 125000,    // Toplam alışveriş
    totalInvoices: 47,         // Fatura sayısı
    averageInvoice: 2659.57,   // Ortalama fatura
    balance: 15000,            // Güncel bakiye (borç/alacak)
    lastPurchaseDate: "2025-10-15"
  },
  recentInvoices: [
    {
      invoiceNumber: "STF-2025-045",
      date: "2025-10-15",
      totalAmount: 5400,
      paidAmount: 0,
      status: "approved"
    }
  ],
  transactions: [
    {
      date: "2025-10-10",
      type: "payment",
      amount: 10000,
      description: "Nakit ödeme"
    }
  ]
}
```

**3. Bakiye Düzeltme**
```javascript
POST /api/customers/:id/adjust-balance

Request Body: {
  amount: -5000,  // Negatif: borç ekle, Pozitif: alacak azalt
  description: "Eski borç kaydı",
  account: "507f1f77bcf86cd799439011",  // Hesap kartı
  date: "2025-10-18"
}

// İşlem adımları:
// 1. Customer.balance += amount
// 2. Account.balance += amount (gelir olarak kaydet)
// 3. Transaction kaydı oluştur
// 4. Log kaydı oluştur

Response: {
  newBalance: 10000,
  transaction: { ... }
}
```

**4. Müşteriler Arası Transfer**
```javascript
POST /api/customers/transfer

Request Body: {
  sourceCustomerId: "xxx",
  targetCustomerId: "yyy",
  amount: 3000,
  description: "Hesap birleştirme"
}

// İşlem adımları:
// 1. Kaynak müşteri bakiyesi -= amount
// 2. Hedef müşteri bakiyesi += amount
// 3. Her iki tarafa da Transaction kaydı

Response: {
  sourceBalance: 5000,
  targetBalance: 8000
}
```

#### 3.5.3 Tedarikçi (Supplier) Yönetimi

**Tedarikçi modeli Müşteri ile aynı yapıdadır.**  
**Tek fark:** `partnerModel` değeri `'Supplier'` olur.

**Temel İşlemler:**
- `POST /api/suppliers` - Tedarikçi oluşturma
- `GET /api/suppliers/:id/details` - Tedarikçi detayları
- `PUT /api/suppliers/:id` - Tedarikçi güncelleme
- `DELETE /api/suppliers/:id` - Tedarikçi silme
- `POST /api/suppliers/:id/adjust-balance` - Bakiye düzeltme

#### 3.5.4 Birleşik Cari Görünümü

**Cari Hesaplar Sayfası (CariPage)**
**Dosya:** `client/src/pages/CariPage.js`

**Özellikler:**
1. **Birleşik Liste:** Müşteri ve tedarikçileri tek tabloda
2. **Filtreleme:** Tip (müşteri/tedarikçi), bakiye durumu
3. **Hızlı İşlem:** Quick Transaction özelliği
4. **İstatistikler:** Toplam müşteri/tedarikçi alacak/borç

**API Endpoint:**
```javascript
GET /api/cari/all?type=customer&balanceFilter=debit

Query Parameters:
- type: customer | supplier | all
- balanceFilter: debit (borçlu) | credit (alacaklı) | all

Response: {
  data: [
    {
      _id: "...",
      name: "ABC Müşteri",
      type: "customer",
      balance: -5000,  // Negatif: borçlu, Pozitif: alacaklı
      phone: "...",
      email: "..."
    }
  ],
  stats: {
    totalCustomers: 145,
    totalSuppliers: 67,
    totalReceivables: 125000,  // Alacaklar
    totalPayables: 87000       // Borçlar
  }
}
```

**Hızlı İşlem (Quick Transaction):**
```javascript
POST /api/cari/quick-transaction

Request Body: {
  partnerId: "xxx",
  partnerModel: "Customer",
  type: "payment",  // payment (tahsilat) | expense (ödeme)
  amount: 5000,
  account: "yyy",  // Hesap kartı
  description: "Nakit tahsilat"
}

// İşlem adımları:
// 1. Partner bakiyesi güncelle
// 2. Account bakiyesi güncelle
// 3. Transaction kaydı oluştur

Response: {
  newBalance: 0,
  transaction: { ... }
}
```

---

**[Bölüm 2 Sonu - Devamı Bölüm 3'te]**
