const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lead title is required.'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
    default: 'New',
  },
  value: {
    type: Number,
    default: 0,
  },
 
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer',
    required: [true, 'A customer is required for a lead.'],
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'A user must be assigned to the lead.'],
  },
 
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('lead', LeadSchema);

