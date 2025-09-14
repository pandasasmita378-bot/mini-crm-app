const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');

// --- POST /api/leads (Create) ---
router.post('/', auth, async (req, res) => {
  // ... existing create logic ...
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Only admins can create leads.' });
  }
  const { title, description, value, customerId, assignedToId } = req.body;
  if (!title || !customerId || !assignedToId) {
    return res.status(400).json({ msg: 'Title, customer, and assigned user are required.' });
  }
  try {
    const leadData = {
      title,
      description,
      value: Number(value) || 0,
      customer: customerId,
      assignedTo: assignedToId,
    };
    if (!req.user.isTemporary) {
      leadData.createdBy = req.user.id;
    }
    const newLead = new Lead(leadData);
    await newLead.save();
    const populatedLead = await Lead.findById(newLead._id)
      .populate('customer', 'name')
      .populate('assignedTo', 'name');
    res.status(201).json(populatedLead);
  } catch (error) {
    console.error('ERROR creating lead:', error.message);
    res.status(500).send('Server Error');
  }
});

// --- GET /api/leads (Read) ---
router.get('/', auth, async (req, res) => {
  // ... existing get logic ...
  try {
    const query = req.user.role === 'admin' ? {} : { assignedTo: req.user.id };
    const leads = await Lead.find(query)
      .populate('customer', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error('ERROR fetching leads:', error.message);
    res.status(500).send('Server Error');
  }
});


// --- PUT /api/leads/:id (Update) ---
// This route is now expanded for full editing capabilities.
router.put('/:id', auth, async (req, res) => {
    const leadId = req.params.id;
  
    try {
      let lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ msg: 'Lead not found.' });
      }
  
      // Authorization: Admin can edit anything. Assigned user can only edit status.
      const isAssignedUser = lead.assignedTo.toString() === req.user.id;
      if (req.user.role !== 'admin' && !isAssignedUser) {
        return res.status(403).json({ msg: 'Not authorized to update this lead.' });
      }

      // If the user is an admin, they can update all fields
      if (req.user.role === 'admin') {
        const { title, description, value, customerId, assignedToId, status } = req.body;
        if (!title || !customerId || !assignedToId) {
            return res.status(400).json({ msg: 'Title, Customer, and Assigned User are required.'});
        }
        lead.title = title;
        lead.description = description;
        lead.value = Number(value) || 0;
        lead.customer = customerId;
        lead.assignedTo = assignedToId;
        if(status) lead.status = status; // Also allow status update
      } 
      // If it's the assigned employee (but not an admin), they can ONLY update the status
      else if (isAssignedUser) {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ msg: 'Only status can be updated by an employee.'});
        }
        lead.status = status;
      }
  
      await lead.save();

      const populatedLead = await Lead.findById(leadId)
        .populate('customer', 'name')
        .populate('assignedTo', 'name');

      res.json(populatedLead);
    } catch (error) {
      console.error(`ERROR in PUT /api/leads/${leadId}:`, error.message);
      res.status(500).send('Server Error');
    }
});

// --- DELETE /api/leads/:id (Delete) ---
router.delete('/:id', auth, async (req, res) => {
    // ... existing delete logic ...
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied.' });
    }
    try {
      const lead = await Lead.findById(req.params.id);
      if (!lead) {
        return res.status(404).json({ msg: 'Lead not found.' });
      }
      await Lead.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Lead has been removed.' });
    } catch (error) {
      console.error('ERROR deleting lead:', error.message);
      res.status(500).send('Server Error');
    }
});

module.exports = router;

