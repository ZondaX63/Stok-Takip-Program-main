const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, admin } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// @route   POST api/transactions
// @desc    Create a transaction
// @access  Private
router.post('/', auth, async (req, res) => {
    const { type, amount, description, date, customer, supplier, account } = req.body;
    
    // Validate ObjectId fields
    if (customer && !mongoose.Types.ObjectId.isValid(customer)) {
        return res.status(400).json({ msg: 'Invalid customer ID' });
    }
    if (supplier && !mongoose.Types.ObjectId.isValid(supplier)) {
        return res.status(400).json({ msg: 'Invalid supplier ID' });
    }
    if (account && !mongoose.Types.ObjectId.isValid(account)) {
        return res.status(400).json({ msg: 'Invalid account ID' });
    }
    
    try {
        const newTransaction = new Transaction({
            type,
            amount,
            description,
            date,
            customer,
            supplier,
            account,
            company: req.user.company
        });
        const transaction = await newTransaction.save();
        // Hesap bakiyesi güncelle
        if (account) {
            const acc = await Account.findOne({ _id: account, company: req.user.company });
            if (acc) {
                if (type === 'income') acc.balance += Number(amount);
                else if (type === 'expense') acc.balance -= Number(amount);
                await acc.save();
            }
        }
        // Cari bakiyesi güncelle (eğer balance alanı varsa)
        if (customer) {
            const cust = await Customer.findOne({ _id: customer, company: req.user.company });
            if (cust && typeof cust.balance === 'number') {
                if (type === 'income') cust.balance -= Number(amount); // Tahsilat: borç azalır
                else if (type === 'expense') cust.balance += Number(amount); // Ödeme: borç artar
                await cust.save();
            }
        }
        if (supplier) {
            const sup = await Supplier.findOne({ _id: supplier, company: req.user.company });
            if (sup && typeof sup.balance === 'number') {
                if (type === 'income') sup.balance -= Number(amount); // Tahsilat: borç azalır
                else if (type === 'expense') sup.balance += Number(amount); // Ödeme: borç artar
                await sup.save();
            }
        }
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { account, type, startDate, endDate, search } = req.query;
        const query = { company: req.user.company };
        if (account) {
            query.$or = [
                { sourceAccount: account },
                { targetAccount: account }
            ];
        }
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = query.$or || [];
            query.$or.push({ description: regex });
        }
        const transactions = await Transaction.find(query);
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { type, amount, description, date, customer, supplier } = req.body;
    
    // Validate ObjectId fields if provided
    if (customer !== undefined) {
        if (customer && !mongoose.Types.ObjectId.isValid(customer)) {
            return res.status(400).json({ msg: 'Invalid customer ID' });
        }
    }
    if (supplier !== undefined) {
        if (supplier && !mongoose.Types.ObjectId.isValid(supplier)) {
            return res.status(400).json({ msg: 'Invalid supplier ID' });
        }
    }
    
    const transactionFields = { type, amount, description, date, customer, supplier };
    try {
        let transaction = await Transaction.findOne({ _id: req.params.id, company: req.user.company });
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { $set: transactionFields },
            { new: true }
        );
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let transaction = await Transaction.findOne({ _id: req.params.id, company: req.user.company });
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/transactions/transfer
// @desc    Create a transfer transaction between accounts
// @access  Private
router.post('/transfer', auth, async (req, res) => {
    try {
        const { sourceAccount, targetAccount, amount, description, date, currency } = req.body;
        if (!sourceAccount || !targetAccount || !amount) {
            return res.status(400).json({ msg: 'Zorunlu alanlar eksik.' });
        }
        if (sourceAccount === targetAccount) {
            return res.status(400).json({ msg: 'Kaynak ve hedef hesap aynı olamaz.' });
        }
        // Hesapları bul ve şirket kontrolü
        const src = await Account.findOne({ _id: sourceAccount, company: req.user.company });
        const tgt = await Account.findOne({ _id: targetAccount, company: req.user.company });
        if (!src || !tgt) return res.status(404).json({ msg: 'Hesap(lar) bulunamadı.' });
        if (src.balance < amount) return res.status(400).json({ msg: 'Yetersiz bakiye.' });
        // Bakiye güncelle
        src.balance -= amount;
        tgt.balance += amount;
        await src.save();
        await tgt.save();
        // Transaction kaydı
        const tx = new Transaction({
            type: 'transfer',
            sourceAccount,
            targetAccount,
            amount,
            description,
            date: date || new Date(),
            currency: currency || src.currency,
            company: req.user.company
        });
        await tx.save();
        res.status(201).json(tx);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Transfer işlemi başarısız.' });
    }
});

// @route   GET api/transactions/flow
// @desc    Get cash flow grouped by day/week/month
// @access  Private
router.get('/flow', auth, async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day', account } = req.query;
        const match = { company: req.user.company };
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = new Date(startDate);
            if (endDate) match.date.$lte = new Date(endDate);
        }
        if (account) {
            match.$or = [
                { sourceAccount: account },
                { targetAccount: account }
            ];
        }
        // Grouping format
        let dateFormat = '%Y-%m-%d';
        if (groupBy === 'month') dateFormat = '%Y-%m';
        if (groupBy === 'week') dateFormat = '%Y-%U';
        const flow = await Transaction.aggregate([
            { $match: match },
            { $addFields: { dateStr: { $dateToString: { format: dateFormat, date: '$date' } } } },
            { $group: {
                _id: { date: '$dateStr', type: '$type' },
                total: { $sum: '$amount' }
            }},
            { $group: {
                _id: '$_id.date',
                data: { $push: { type: '$_id.type', total: '$total' } }
            }},
            { $sort: { _id: 1 } }
        ]);
        // Format output
        const result = flow.map(f => {
            const income = f.data.find(d => d.type === 'income')?.total || 0;
            const expense = f.data.find(d => d.type === 'expense')?.total || 0;
            const transferIn = f.data.find(d => d.type === 'transfer')?.total || 0;
            return { date: f._id, income, expense, transferIn };
        });
        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Nakit akışı raporu alınamadı.' });
    }
});

// @route   POST api/transactions/cari-transfer
// @desc    Cari (müşteri/tedarikçi) arası borç transferi
// @access  Private
router.post('/cari-transfer', auth, async (req, res) => {
    try {
        const { fromType, fromId, toType, toId, amount, description, date } = req.body;
        if (!fromType || !fromId || !toType || !toId || !amount || amount <= 0) {
            return res.status(400).json({ msg: 'Zorunlu alanlar eksik.' });
        }
        if (fromType === toType && fromId === toId) {
            return res.status(400).json({ msg: 'Kaynak ve hedef cari aynı olamaz.' });
        }
        // Cari var mı kontrolü
        let fromCari, toCari;
        if (fromType === 'customer') {
            fromCari = await Customer.findOne({ _id: fromId, company: req.user.company });
        } else {
            fromCari = await Supplier.findOne({ _id: fromId, company: req.user.company });
        }
        if (toType === 'customer') {
            toCari = await Customer.findOne({ _id: toId, company: req.user.company });
        } else {
            toCari = await Supplier.findOne({ _id: toId, company: req.user.company });
        }
        if (!fromCari || !toCari) return res.status(404).json({ msg: 'Cari(ler) bulunamadı.' });
        // Borç transferi: from cari borcu azalır (income), to cari borcu artar (expense)
        const txFrom = new Transaction({
            type: 'income',
            amount,
            description: description || 'Cari transfer',
            date: date || new Date(),
            company: req.user.company,
            customer: fromType === 'customer' ? fromId : undefined,
            supplier: fromType === 'supplier' ? fromId : undefined,
            createdBy: req.user.id
        });
        const txTo = new Transaction({
            type: 'expense',
            amount,
            description: description || 'Cari transfer',
            date: date || new Date(),
            company: req.user.company,
            customer: toType === 'customer' ? toId : undefined,
            supplier: toType === 'supplier' ? toId : undefined,
            createdBy: req.user.id
        });
        await txFrom.save();
        await txTo.save();
        res.status(201).json({ msg: 'Cari transfer başarılı', txFrom, txTo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Cari transfer sırasında hata oluştu.' });
    }
});

module.exports = router;
