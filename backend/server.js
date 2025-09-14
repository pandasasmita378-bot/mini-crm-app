require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_crm';
mongoose.connect(MONGO_URI)
  .then(() => console.log('>>> MongoDB connected successfully.'))
  .catch(err => {
    console.error('>>> MongoDB connection error:', err.message);
    process.exit(1); 
  });

app.use('/api/users', require('./routes/users'));

app.use('/api/customers', require('./routes/customers'));

app.use('/api/leads', require('./routes/leads'));

app.get('/', (_req, res) => res.send('CRM API is running.'));

app.use((req, res) => res.status(404).json({ msg: `Route Not Found: ${req.method} ${req.path}` }));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`>>> Server started on http://localhost:${PORT}`));



