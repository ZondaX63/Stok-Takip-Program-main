# 📦 Stok Takip Programı

Modern ve kullanıcı dostu stok, fatura ve cari hesap yönetim sistemi.

## 🚀 Özellikler

### 📊 Stok Yönetimi
- Ürün ekleme, düzenleme ve silme
- Kategori ve marka yönetimi
- Stok hareketleri takibi
- Düşük stok uyarıları

### 💰 Fatura Yönetimi
- Satış ve alış faturaları
- Teklif ve sipariş yönetimi
- Fatura ödemelerini takip
- Çoklu para birimi desteği

### 👥 Cari Hesap Yönetimi
- Müşteri ve tedarikçi yönetimi
- Alacak/Verecek takibi
- Hesap hareketleri
- Cari hesap özeti

### 💳 Muhasebe
- Kasa, banka ve kredi kartı hesapları
- Gelir/gider takibi
- Hesaplar arası transfer
- Finansal raporlar

### 📈 Raporlama
- Satış raporları
- Stok raporları
- Finansal raporlar
- Özelleştirilebilir tarih aralıkları

## 🛠️ Teknolojiler

### Frontend
- **React** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI Icons** - Icon library
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📋 Gereksinimler

- **Node.js** 14.x veya üzeri
- **MongoDB** 4.x veya üzeri
- **npm** veya **yarn**

## ⚙️ Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd Stok-Takip-Program-main
```

### 2. Backend Kurulumu
```bash
cd server
npm install
```

### 3. Frontend Kurulumu
```bash
cd ../client
npm install
```

### 4. Ortam Değişkenlerini Ayarlayın

**Backend** (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stok-takip
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Frontend** (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Çalıştırma

### Development Modu

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm start
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:5000/api`

### Production Build

**Frontend:**
```bash
cd client
npm run build
```

Build dosyaları `client/build` klasöründe oluşturulur.

## 📁 Proje Yapısı

```
Stok-Takip-Program-main/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── api.js         # API configuration
│   │   └── App.js         # Main app component
│   └── package.json
│
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 Varsayılan Kullanıcı

İlk kurulumda aşağıdaki kullanıcı ile giriş yapabilirsiniz:

- **Email:** admin@example.com
- **Şifre:** admin123

> ⚠️ **Güvenlik:** Üretim ortamında mutlaka şifreyi değiştirin!

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma

### Products
- `GET /api/products` - Tüm ürünleri listele
- `POST /api/products` - Yeni ürün ekle
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil

### Customers
- `GET /api/customers` - Müşterileri listele
- `GET /api/customers/:id/debt` - Müşteri borç bilgisi
- `POST /api/customers` - Yeni müşteri ekle

### Suppliers
- `GET /api/suppliers` - Tedarikçileri listele
- `GET /api/suppliers/:id/debt` - Tedarikçi borç bilgisi
- `POST /api/suppliers` - Yeni tedarikçi ekle

### Invoices
- `GET /api/invoices` - Faturaları listele
- `POST /api/invoices` - Yeni fatura oluştur
- `PUT /api/invoices/:id` - Fatura güncelle

### Accounts
- `GET /api/accounts` - Hesapları listele
- `POST /api/accounts/transfer` - Hesaplar arası transfer

## 🎨 Özellikler

### Muhasebe Sistemi
- ✅ Çift yönlü bakiye desteği (müşteri/tedarikçi hem borçlu hem alacaklı olabilir)
- ✅ Alacak/Verecek hesapları net gösterimi
- ✅ Cari hesaplar özeti widget'ı
- ✅ Renk kodlu bakiye gösterimi (🟢 Alacak, 🔴 Verecek)

### Kullanıcı Arayüzü
- ✅ Modern ve responsive tasarım
- ✅ Koyu/Açık tema desteği
- ✅ Mobil uyumlu
- ✅ Hızlı arama ve filtreleme

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not:** Bu proje aktif geliştirme aşamasındadır. Önerilerinizi bekliyoruz!
