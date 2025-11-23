const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, admin } = require('../middleware/authMiddleware');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Supplier = require('../models/Supplier');

// Specific routes should be defined before dynamic routes like /:id

// @route   GET api/invoices/stats
// @desc    Get invoice statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        console.log('Fetching stats for company:', req.user.company);

        // Get all invoices for the company
        const allInvoices = await Invoice.find({ company: req.user.company });

        // Calculate stats
        const stats = {
            totalIn: allInvoices.filter(inv => inv.type === 'purchase').length,
            totalOut: allInvoices.filter(inv => inv.type === 'sale').length,
            totalDraft: allInvoices.filter(inv => inv.status === 'draft').length,
            totalApproved: allInvoices.filter(inv => inv.status === 'approved').length,
            totalPaid: allInvoices.filter(inv => inv.status === 'paid').length,
            totalAmount: allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
        };

        console.log('Calculated stats:', stats);
        res.json(stats);
    } catch (err) {
        console.error('Error in /stats endpoint:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/invoices/due-soon
// @desc    Get invoices with due dates within 3 days and create notifications
// @access  Private
router.get('/due-soon', auth, async (req, res) => {
    try {
        const now = new Date();
        const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        const invoices = await Invoice.find({
            company: req.user.company,
            dueDate: { $gte: now, $lte: soon },
            status: { $ne: 'paid' } // Assuming a 'paid' status exists
        });

        for (const invoice of invoices) {
            const existing = await Notification.findOne({
                type: 'due_date',
                relatedId: invoice._id,
                company: req.user.company,
            });

            if (!existing) {
                await Notification.create({
                    type: 'due_date',
                    message: `Fatura #${invoice.invoiceNumber || invoice._id} vadesi yaklaşıyor.`,
                    relatedId: invoice._id,
                    company: req.user.company
                });
            }
        }

        res.json({ msg: `${invoices.length} adet faturanın vadesi yaklaşıyor.` });
    } catch (err) {
        console.error('Error in /due-soon route:', err);
        res.status(500).json({ msg: 'Server error while fetching due invoices.' });
    }
});

// @route   GET api/invoices
// @desc    Get all invoices with pagination
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'date', order = 'desc', search = '', customer, supplier, type, status } = req.query;

        const query = { company: req.user.company };

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { invoiceNumber: searchRegex }
            ];
        }

        if (customer) {
            query.customerOrSupplier = customer;
        }
        if (supplier) {
            query.customerOrSupplier = supplier;
        }
        if (type) {
            query.type = type;
        }
        if (status) {
            query.status = status;
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10) === 0 ? undefined : parseInt(limit, 10),
            sort: { [sort]: order === 'asc' ? 1 : -1 }
        };

        if (parseInt(limit, 10) === 0) {
            const invoices = await Invoice.find(query)
                .sort(options.sort);

            // Manually populate customer/supplier data
            const populatedInvoices = await Promise.all(invoices.map(async (invoice) => {
                const invoiceObj = invoice.toObject();
                if (invoice.partnerModel === 'Customer') {
                    const customer = await Customer.findById(invoice.customerOrSupplier).select('name');
                    invoiceObj.customerOrSupplier = customer;
                } else if (invoice.partnerModel === 'Supplier') {
                    const supplier = await Supplier.findById(invoice.customerOrSupplier).select('name');
                    invoiceObj.customerOrSupplier = supplier;
                }
                return invoiceObj;
            }));

            return res.json({ docs: populatedInvoices });
        }

        const result = await Invoice.paginate(query, options);

        // Manually populate customer/supplier data
        const populatedInvoices = await Promise.all(result.docs.map(async (invoice) => {
            const invoiceObj = invoice.toObject();
            if (invoice.partnerModel === 'Customer') {
                const customer = await Customer.findById(invoice.customerOrSupplier).select('name');
                invoiceObj.customerOrSupplier = customer;
            } else if (invoice.partnerModel === 'Supplier') {
                const supplier = await Supplier.findById(invoice.customerOrSupplier).select('name');
                invoiceObj.customerOrSupplier = supplier;
            }
            return invoiceObj;
        }));

        res.json({
            invoices: populatedInvoices,
            totalInvoices: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/invoices/:id
// @desc    Get invoice by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('products.product');
        if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });

        // Manually populate customer/supplier data
        const invoiceObj = invoice.toObject();
        if (invoice.partnerModel === 'Customer') {
            const customer = await Customer.findById(invoice.customerOrSupplier).select('name');
            invoiceObj.customerOrSupplier = customer;
        } else if (invoice.partnerModel === 'Supplier') {
            const supplier = await Supplier.findById(invoice.customerOrSupplier).select('name');
            invoiceObj.customerOrSupplier = supplier;
        }

        res.json(invoiceObj);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/invoices
// @desc    Create an invoice (as draft)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { invoiceNumber, customerOrSupplier, partnerModel, products, totalAmount, type, date, dueDate, vat, discount1, discount2, discount3, discount4, currency, exchangeRate } = req.body;

    // Validate customerOrSupplier ObjectId
    if (customerOrSupplier && !mongoose.Types.ObjectId.isValid(customerOrSupplier)) {
        return res.status(400).json({ msg: 'Invalid customer or supplier ID' });
    }

    // Validate product ObjectIds in products array
    if (products && Array.isArray(products)) {
        for (const productItem of products) {
            if (productItem.product && !mongoose.Types.ObjectId.isValid(productItem.product)) {
                return res.status(400).json({ msg: 'Invalid product ID' });
            }
        }
    }

    try {
        const newInvoice = new Invoice({
            invoiceNumber,
            customerOrSupplier,
            partnerModel,
            products,
            totalAmount,
            type,
            date,
            dueDate,
            vat,
            discount1,
            discount2,
            discount3,
            discount4,
            currency,
            exchangeRate,
            company: req.user.company,
            status: 'draft' // Always created as draft
        });
        const invoice = await newInvoice.save();
        // Yaklaşan ödeme bildirimi
        if (dueDate && new Date(dueDate) - new Date() < 4 * 24 * 60 * 60 * 1000) {
            const existing = await Notification.findOne({
                type: 'due_date',
                relatedId: invoice._id,
                company: req.user.company,
                read: false
            });
            if (!existing) {
                await Notification.create({
                    type: 'due_date',
                    message: `${invoice.invoiceNumber || 'Fatura'} vadesi yaklaşıyor!`,
                    relatedId: invoice._id,
                    company: req.user.company
                });
            }
        }
        res.json(invoice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/invoices/:id
// @desc    Update an invoice
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { invoiceNumber, customerOrSupplier, partnerModel, products, totalAmount, type, date, currency, exchangeRate } = req.body;

    // Validate customerOrSupplier ObjectId if provided
    if (customerOrSupplier && !mongoose.Types.ObjectId.isValid(customerOrSupplier)) {
        return res.status(400).json({ msg: 'Invalid customer or supplier ID' });
    }

    // Validate product ObjectIds in products array if provided
    if (products && Array.isArray(products)) {
        for (const productItem of products) {
            if (productItem.product && !mongoose.Types.ObjectId.isValid(productItem.product)) {
                return res.status(400).json({ msg: 'Invalid product ID' });
            }
        }
    }

    const invoiceFields = { invoiceNumber, customerOrSupplier, partnerModel, products, totalAmount, type, date, currency, exchangeRate };
    try {
        let invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
        if (invoice.status === 'approved' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Onaylanmış fatura değiştirilemez.' });
        }
        invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { $set: invoiceFields },
            { new: true }
        );
        res.json(invoice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/invoices/:id
// @desc    Delete an invoice
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
        if (invoice.status === 'approved' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Onaylanmış fatura silinemez.' });
        }
        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Invoice removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/invoices/:id/revert
// @desc    Revert an approved invoice to draft and revert stock
// @access  Private/Admin
router.post('/:id/revert', [auth, admin], async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }
        if (invoice.status !== 'approved') {
            return res.status(400).json({ msg: 'Only approved invoices can be reverted.' });
        }
        // Revert stock for each product in the invoice
        for (const item of invoice.products) {
            const product = await Product.findById(item.product);
            if (!product) continue;
            const quantityChange = invoice.type === 'sale' ? item.quantity : -item.quantity;
            product.quantity += quantityChange;
            await product.save();
            // Remove related stock movement
            await StockMovement.deleteMany({ product: item.product, invoice: invoice._id });
        }
        invoice.status = 'draft';
        await invoice.save();
        res.json({ msg: 'Invoice reverted to draft and stock reverted', invoice });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/invoices/:id/approve
// @desc    Approve an invoice and update stock
// @access  Private/Admin
router.post('/:id/approve', [auth, admin], async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }
        if (invoice.status === 'approved') {
            return res.status(400).json({ msg: 'Invoice is already approved' });
        }
        // Check stock for each product (for sales)
        if (invoice.type === 'sale') {
            for (const item of invoice.products) {
                const product = await Product.findById(item.product);
                if (!product) {
                    return res.status(404).json({ msg: `Product with id ${item.product} not found` });
                }
                if (product.quantity < item.quantity) {
                    return res.status(400).json({ msg: `Yeterli stok yok: ${product.name}` });
                }
            }
        }
        // Update stock for each product in the invoice
        for (const item of invoice.products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ msg: `Product with id ${item.product} not found` });
            }
            const movementType = invoice.type === 'sale' ? 'out' : 'in';
            const quantityChange = invoice.type === 'sale' ? -item.quantity : +item.quantity;
            product.quantity += quantityChange;
            await product.save();
            // Create stock movement record
            const stockMovement = new StockMovement({
                product: item.product,
                invoice: invoice._id,
                type: movementType,
                quantity: item.quantity,
                company: req.user.company,
            });
            await stockMovement.save();
            // Kritik stok bildirimi
            if (product.trackStock && product.quantity <= product.criticalStockLevel) {
                const existing = await Notification.findOne({
                    type: 'critical_stock',
                    relatedId: product._id,
                    company: req.user.company,
                    read: false
                });
                if (!existing) {
                    await Notification.create({
                        type: 'critical_stock',
                        message: `${product.name} ürünü kritik stok seviyesinin altında!`,
                        relatedId: product._id,
                        company: req.user.company
                    });
                }
            }
        }
        invoice.status = 'approved';
        await invoice.save();
        res.json({ msg: 'Invoice approved and stock updated', invoice });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/invoices/:id/collect
// @desc    Tahsilat işlemi: Faturayı öde ve ilgili hesaba kaydet
// @access  Private
router.post('/:id/collect', auth, async (req, res) => {
    const { amount, accountId } = req.body;
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) return res.status(404).json({ msg: 'Fatura bulunamadı' });
        if (invoice.status !== 'approved') return res.status(400).json({ msg: 'Sadece onaylı faturalar tahsil edilebilir.' });
        if (!amount || amount <= 0) return res.status(400).json({ msg: 'Geçerli bir tahsilat miktarı girin.' });
        if (!accountId) return res.status(400).json({ msg: 'Hesap seçimi zorunludur.' });

        // Hesap kontrolü
        const account = await Account.findOne({ _id: accountId, company: req.user.company });
        if (!account) return res.status(404).json({ msg: 'Hesap bulunamadı.' });

        // Transaction oluştur
        const transaction = new Transaction({
            type: 'income',
            description: `Fatura tahsilatı: ${invoice.invoiceNumber}`,
            amount,
            date: new Date(),
            relatedInvoice: invoice._id,
            customer: invoice.partnerModel === 'Customer' ? invoice.customerOrSupplier : undefined,
            supplier: invoice.partnerModel === 'Supplier' ? invoice.customerOrSupplier : undefined,
            company: req.user.company,
            targetAccount: account._id,
            createdBy: req.user.id
        });
        await transaction.save();

        // Hesap bakiyesini güncelle
        account.balance += amount;
        await account.save();

        // Faturanın ödenen miktarını güncelle
        invoice.paidAmount = (invoice.paidAmount || 0) + amount;
        // Tamamı ödendiyse durumu 'paid' yap
        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = 'paid';
        }
        await invoice.save();

        res.json({ msg: 'Tahsilat başarılı', invoice, transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Tahsilat sırasında hata oluştu.' });
    }
});

// @route   POST api/invoices/:id/pay
// @desc    Alış faturası için ödeme işlemi
// @access  Private
router.post('/:id/pay', auth, async (req, res) => {
    const { amount, accountId, description } = req.body;
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) return res.status(404).json({ msg: 'Fatura bulunamadı' });
        if (invoice.type !== 'purchase') return res.status(400).json({ msg: 'Sadece alış faturalarına ödeme yapılabilir.' });
        if (invoice.status !== 'approved') return res.status(400).json({ msg: 'Sadece onaylı faturalar ödenebilir.' });
        if (!amount || amount <= 0) return res.status(400).json({ msg: 'Geçerli bir ödeme miktarı girin.' });
        if (!accountId) return res.status(400).json({ msg: 'Hesap seçimi zorunludur.' });

        // Hesap kontrolü
        const account = await Account.findOne({ _id: accountId, company: req.user.company });
        if (!account) return res.status(404).json({ msg: 'Hesap bulunamadı.' });
        if (account.balance < amount) return res.status(400).json({ msg: 'Yetersiz bakiye.' });

        // Transaction oluştur
        const transaction = new Transaction({
            type: 'expense',
            description: description || `Fatura ödemesi: ${invoice.invoiceNumber}`,
            amount,
            date: new Date(),
            relatedInvoice: invoice._id,
            supplier: invoice.partnerModel === 'Supplier' ? invoice.customerOrSupplier : undefined,
            customer: invoice.partnerModel === 'Customer' ? invoice.customerOrSupplier : undefined,
            company: req.user.company,
            sourceAccount: account._id,
            createdBy: req.user.id
        });
        await transaction.save();

        // Hesap bakiyesini güncelle
        account.balance -= amount;
        await account.save();

        // Faturanın ödenen miktarını güncelle
        invoice.paidAmount = (invoice.paidAmount || 0) + amount;
        // Tamamı ödendiyse durumu 'paid' yap
        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = 'paid';
        }
        await invoice.save();

        res.json({ msg: 'Ödeme başarılı', invoice, transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Ödeme sırasında hata oluştu.' });
    }
});

// @route   POST api/invoices/:id/revert-to-approved
// @desc    Revert a paid invoice back to approved status
// @access  Private/Admin
router.post('/:id/revert-to-approved', [auth, admin], async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }
        if (invoice.status !== 'paid') {
            return res.status(400).json({ msg: 'Only paid invoices can be reverted to approved.' });
        }

        // Reset paid amount
        invoice.paidAmount = 0;
        invoice.status = 'approved';
        await invoice.save();

        res.json({ msg: 'Invoice reverted to approved status', invoice });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PATCH api/invoices/:id/status
// @desc    Update invoice status (draft, approved, paid, canceled)
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['draft', 'approved', 'paid', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Geçersiz durum.' });
        }

        const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.company });
        if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });

        invoice.status = status;
        await invoice.save();

        res.json({ msg: 'Fatura durumu güncellendi', invoice });
    } catch (err) {
        console.error('PATCH /invoices/:id/status', err);
        res.status(500).json({ msg: 'Fatura durumu güncellenemedi.' });
    }
});

module.exports = router;
