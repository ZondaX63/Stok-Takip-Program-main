const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Account = require('../models/Account');
const { auth } = require('../middleware/authMiddleware');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// Şirket bazlı tüm hesapları getir
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ company: req.user.company });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Hesaplar listelenemedi.' });
  }
});

// Yeni hesap ekle
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, balance, currency, cariType, email, phone, address } = req.body;
    let partnerId = null;
    let cari = null;
    if (type === 'cari') {
      if (!cariType || !email) {
        return res.status(400).json({ error: 'Cari hesap için cariType ve email zorunludur.' });
      }
      if (cariType === 'customer') {
        cari = await Customer.findOne({ email, company: req.user.company });
        if (!cari) {
          cari = new Customer({ name, email, phone, address, company: req.user.company });
          await cari.save();
        }
      } else if (cariType === 'supplier') {
        cari = await Supplier.findOne({ email, company: req.user.company });
        if (!cari) {
          cari = new Supplier({ name, email, phone, address, company: req.user.company });
          await cari.save();
        }
      }
      partnerId = cari._id;
    }
    const account = new Account({
      name,
      type,
      balance: balance || 0,
      currency: currency || 'TRY',
      company: req.user.company,
      cariType: type === 'cari' ? cariType : null,
      partnerId: type === 'cari' ? partnerId : null
    });
    await account.save();
    res.status(201).json({ account, cari });
  } catch (err) {
    res.status(400).json({ error: 'Hesap eklenemedi.' });
  }
});

// Hesap güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, balance, currency, cariType, partnerId } = req.body;
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      { name, type, balance, currency, cariType, partnerId },
      { new: true }
    );
    if (!account) return res.status(404).json({ error: 'Hesap bulunamadı.' });
    res.json(account);
  } catch (err) {
    res.status(400).json({ error: 'Hesap güncellenemedi.' });
  }
});

// Hesap sil
router.delete('/:id', auth, async (req, res) => {
  try {
    // ObjectId validasyonu
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Geçersiz hesap ID.' });
    }

    const account = await Account.findOneAndDelete({ _id: req.params.id, company: req.user.company });
    if (!account) return res.status(404).json({ error: 'Hesap bulunamadı.' });
    
    // Eğer partnerId varsa ilgili partneri de sil
    if (account.type === 'cari' && account.partnerId && account.cariType) {
      if (account.cariType === 'customer') {
        await Customer.findOneAndDelete({ _id: account.partnerId, company: req.user.company });
      } else if (account.cariType === 'supplier') {
        await Supplier.findOneAndDelete({ _id: account.partnerId, company: req.user.company });
      }
    }
    res.json({ message: 'Hesap silindi.', deletedAccount: account });
  } catch (err) {
    console.error('Account delete error:', err);
    res.status(400).json({ error: 'Hesap silinemedi.' });
  }
});

// Hesaplar arası transfer
router.post('/transfer', auth, async (req, res) => {
  try {
    const { sourceAccountId, targetAccountId, amount, description, date } = req.body;
    if (!sourceAccountId || !targetAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Geçersiz transfer bilgisi.' });
    }
    if (sourceAccountId === targetAccountId) {
      return res.status(400).json({ error: 'Kaynak ve hedef hesap aynı olamaz.' });
    }
    // Hesapları bul ve şirket kontrolü yap
    const [source, target] = await Promise.all([
      Account.findOne({ _id: sourceAccountId, company: req.user.company }),
      Account.findOne({ _id: targetAccountId, company: req.user.company })
    ]);
    if (!source || !target) {
      return res.status(404).json({ error: 'Hesap(lar) bulunamadı.' });
    }
    if (source.balance < amount) {
      return res.status(400).json({ error: 'Yetersiz bakiye.' });
    }
    // Bakiye güncelle
    source.balance -= amount;
    target.balance += amount;
    await Promise.all([source.save(), target.save()]);
    // Transaction kaydı
    const Transaction = require('../models/Transaction');
    const transaction = new Transaction({
      type: 'transfer',
      description: description || '',
      amount,
      date: date || new Date(),
      company: req.user.company,
      sourceAccount: source._id,
      targetAccount: target._id,
      createdBy: req.user.id
    });
    await transaction.save();
    res.status(201).json({ message: 'Transfer başarılı', transaction });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ error: 'Transfer işlemi başarısız.' });
  }
});

module.exports = router; 