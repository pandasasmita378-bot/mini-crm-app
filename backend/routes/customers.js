const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

router.post('/', auth, async (req, res) => {
 
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Only admins can create customers.' });
  }
  const { name, email, phone, company } = req.body;
  if (!name || !email) {
    return res.status(400).json({ msg: 'Name and email are required.' });
  }
  try {
    const customerData = { name, email, phone, company };
    if (!req.user.isTemporary) {
      customerData.createdBy = req.user.id;
    }
    const newCustomer = new Customer(customerData);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('ERROR creating customer:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(e => e.message).join(' ');
      return res.status(400).json({ msg: message || 'Invalid data provided.' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'A customer with this email already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied.' });
  }
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('ERROR fetching customers:', error.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
 
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied.' });
  }

  const { name, email, phone, company } = req.body;
  if (!name || !email) {
    return res.status(400).json({ msg: 'Name and email are required fields.' });
  }

  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found.' });
    }


    const updatedFields = { name, email, phone, company };

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    res.json(customer);

  } catch (error) {
    console.error('ERROR updating customer:', error.message);
     if (error.code === 11000) {
      return res.status(400).json({ msg: 'Another customer with this email already exists.' });
    }
    res.status(500).send('Server Error');
  }
});



router.delete('/:id', auth, async (req, res) => {
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied.' });
  }
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found.' });
    }
    await Lead.deleteMany({ customer: req.params.id });
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Customer and all associated leads have been removed.' });
  } catch (error) {
    console.error('ERROR deleting customer:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

