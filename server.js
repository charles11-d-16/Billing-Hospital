const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const TransactionType = require('./models/TransactionType');
const Patient = require('./models/Patient');
const Transaction = require('./models/Transaction');
const Staff = require('./models/Staff');
const ProcessedTransaction = require('./models/ProcessedTransaction');
const TransactionModel = require('./models/Transaction');
const VoidTransaction = require('./models/VoidTransaction');

const app = express();
const port = 3000;
const session = require('express-session');





app.use(session({
  secret: 'super-secret-key', 
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


mongoose.connect('mongodb://127.0.0.1:27017/BillingHospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('MongoDB Connection Error:', err);
});



app.get('/add-new-transaction', async (req, res) => {
  const transactionTypes = await TransactionType.find();
  const patientId = req.query.patientId;

  if (patientId) {
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).send("Patient not found.");
    }
    return res.render('addNewTransaction', { transactionTypes, patient });
  }

  
  res.render('addNewTransaction', { transactionTypes, patient: null });
});





app.post('/search-patient', async (req, res) => {
  const { search } = req.body;
  const patient = await Patient.findOne({
    $or: [{ name: new RegExp(search, 'i') }, { patientId: search }]
  });

  const transactionTypes = await TransactionType.find(); 
  res.render('addNewTransaction', { transactionTypes, patient });
});


app.post('/submit-transaction', async (req, res) => {
  const { patientId, patientName, transactionType, description, unitAmount, quantity, birthday } = req.body;

  console.log("Birthday from req.body:", birthday); 

  const transactionNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const totalAmount = Number(unitAmount) * Number(quantity);

  const patient = await Patient.findOne({ patientId });

  const newTransaction = new Transaction({
    transactionNumber,
    patientId,
    patientName,
    transactionType,
    description,
    unitAmount,
    quantity,
    totalAmount,
    birthday: birthday ? new Date(birthday) : patient?.birthday, 
    address: patient?.address,
    gender: patient?.gender
  });

  
await newTransaction.save();
res.redirect('/transaction');


});




app.get('/add-patient', (req, res) => {
  res.render('addPatient');  
});


app.post('/add-patient', async (req, res) => {
  const { name, address, birthday, gender } = req.body; 

 
  const patientId = Math.random().toString(36).substring(2, 9).toUpperCase();

  const newPatient = new Patient({
    patientId,  
    name,
    address,
    birthday,  
    gender
  });

  await newPatient.save();

  res.redirect('/addpatient'); 
});


app.get('/', (req, res) => {
  res.redirect('/login'); 
});


app.get('/index', (req, res) => {
  const role = req.session.user?.role || '';
  res.render('index', { role });  
});



app.get('/addpatient', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.render('addPatient', { patients });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading patient list");
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post('/submit-multiple-transactions', async (req, res) => {
  const { patientId, patientName, transactionType, description, unitAmount, quantity, birthday } = req.body;

  const patient = await Patient.findOne({ patientId });
  const transactionNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const transactions = [];

  for (let i = 0; i < transactionType.length; i++) {
    transactions.push({
      transactionNumber,
      patientId,
      patientName,
      transactionType: transactionType[i],
      description: description[i],
      unitAmount: Number(unitAmount[i]),
      quantity: Number(quantity[i]),
      totalAmount: Number(unitAmount[i]) * Number(quantity[i]),
      birthday: birthday ? new Date(birthday) : patient?.birthday,
      address: patient?.address,
      gender: patient?.gender
    });
  }

  await Transaction.insertMany(transactions);

  res.redirect('/transaction');
});





app.get('/records', async (req, res) => {
  try {
    const transactions = await Transaction.find(); 

    const processedTransactions = await ProcessedTransaction.find();

    
    const processedWithDiscounts = processedTransactions.map(pt => {
      
      pt.senior = pt.senior || false;
      pt.resident = pt.resident || false;
      pt.philHealth = pt.philHealth || 0;
      pt.discountedAmount = pt.discountedAmount || 0;

      
      pt.transactions = pt.transactions.map(tran => ({
        ...tran,
        totalAmount: tran.totalAmount || 0
      }));

      return pt;
    });

    res.render('records', {
      transactions,
      processedTransactions: processedWithDiscounts
    });

  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).send('Internal Server Error');
  }
});





app.get('/transaction', async (req, res) => {
  const allPatients = await Patient.find();

  
  const patientsWithTransactions = [];

  for (const patient of allPatients) {
    const hasTransactions = await Transaction.exists({ patientId: patient.patientId });
    if (hasTransactions) {
      patientsWithTransactions.push(patient);
    }
  }

  res.render('transaction', {
    patients: patientsWithTransactions,
    transactions: null,
    grandTotal: 0,
    adjustedTotal: 0,
    isSenior: false,
    isResident: false,
    philHealthAmount: 0
  });
});




app.post('/view-transactions', async (req, res) => {
  const { patientId } = req.body;

  
  const allPatients = await Patient.find();

 
  const patientsWithTransactions = [];

  for (const patient of allPatients) {
    const hasTransactions = await Transaction.exists({ patientId: patient.patientId });
    if (hasTransactions) {
      patientsWithTransactions.push(patient);
    }
  }

  
  const transactions = await Transaction.find({ patientId });

  let grandTotal = 0;
  transactions.forEach(t => {
    grandTotal += parseFloat(t.totalAmount);
  });

  const isSenior = false;
  const isResident = false;
  const philHealthAmount = 0;
  const adjustedTotal = grandTotal;

  res.render('transaction', {
    patients: patientsWithTransactions,
    transactions,
    grandTotal,
    adjustedTotal,
    isSenior,
    isResident,
    philHealthAmount
  });
});



app.post('/save-processed', async (req, res) => {
  const {
    patientId,
    patientName,
    birthday,
    address,
    gender,
    originalTotal,
    isSenior,
    isResident,
    philHealthAmount
  } = req.body;

  const original = Number(originalTotal);
  const philHealth = Number(philHealthAmount) || 0;

  let adjusted = original;

  if (isSenior === 'true') {
    adjusted -= original * 0.10;
  }

  if (isResident === 'true') {
    adjusted -= original * 0.10;
  }

  adjusted -= philHealth;

  const transactionsArray = await TransactionModel.find({ patientId });

  const processed = new ProcessedTransaction({
    patientId,
    patientName,
    birthday: birthday ? new Date(birthday) : null,
    address,
    gender,
    originalTotal: original,
    adjustedTotal: adjusted,
    isSenior: isSenior === 'true',
    isResident: isResident === 'true',
    philHealthAmount: philHealth,
    dateProcessed: new Date(),
    transactions: transactionsArray
  });

  await processed.save();

  
  await TransactionModel.deleteMany({ patientId });

  
  const allPatients = await Patient.find();
  const patientsWithTransactions = [];

  for (const patient of allPatients) {
    const hasTransactions = await TransactionModel.exists({ patientId: patient.patientId });
    if (hasTransactions) {
      patientsWithTransactions.push(patient);
    }
  }

  res.render('transaction', {
    patients: patientsWithTransactions,
    transactions: null,
    grandTotal: 0,
    adjustedTotal: 0,
    isSenior: false,
    isResident: false,
    philHealthAmount: 0
  });
});


app.get('/processed', async (req, res) => {
  const { startDate, endDate, search, discounted } = req.query;

  const query = {};


  if (startDate || endDate) {
    query.dateProcessed = {};
    if (startDate) {
      query.dateProcessed.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 
      query.dateProcessed.$lte = end;
    }
  }

  
  if (search) {
    query.$or = [
      { patientId: { $regex: search, $options: 'i' } },
      { patientName: { $regex: search, $options: 'i' } }
    ];
  }

  try {
   
    let processed = await ProcessedTransaction.find(query).lean();

   
    if (discounted === 'true') {
      processed = processed.filter(p => p.adjustedTotal < p.originalTotal);
    } else if (discounted === 'false') {
      processed = processed.filter(p => p.adjustedTotal >= p.originalTotal);
    }

   
    let grandAdjusted = 0;
    let grandDiscount = 0;

    processed.forEach(p => {
      const discount = p.originalTotal - p.adjustedTotal;
      grandAdjusted += p.adjustedTotal;
      grandDiscount += discount;
    });

    res.render('processed', {
      processed,
      grandAdjusted: grandAdjusted.toFixed(2),
      grandDiscount: grandDiscount.toFixed(2),
      search,
      startDate,
      endDate,
      discounted
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving processed transactions.');
  }
});






app.get('/api/dashboard-analytics', async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

 
  const processed = await ProcessedTransaction.find({ dateProcessed: { $gte: start, $lte: end } });
  const transactions = await Transaction.find({ date: { $gte: start, $lte: end } });

  
  const unprocessedPatients = new Set();
  transactions.forEach(t => unprocessedPatients.add(t.patientId));

  const uniquePatientMap = {};
  processed.forEach(p => {
    const key = `${p.patientId}-${p.patientName}`;
    if (!uniquePatientMap[key]) uniquePatientMap[key] = p.dateProcessed;
  });

  transactions.forEach(t => {
    const key = `${t.patientId}-${t.patientName}`;
    if (!uniquePatientMap[key]) uniquePatientMap[key] = t.date;
  });

  const patientPerDay = {};
  for (const key in uniquePatientMap) {
    const date = new Date(uniquePatientMap[key]).toISOString().split('T')[0];
    patientPerDay[date] = (patientPerDay[date] || 0) + 1;
  }

  
  const transactionsPerDay = {};

  transactions.forEach(t => {
    const date = new Date(t.date).toISOString().split('T')[0];
    transactionsPerDay[date] = (transactionsPerDay[date] || 0) + 1;
  });

  processed.forEach(p => {
    const date = new Date(p.dateProcessed).toISOString().split('T')[0];
    transactionsPerDay[date] = (transactionsPerDay[date] || 0) + 1;
  });

 
  const amountPerDay = {};
  transactions.forEach(t => {
    const date = new Date(t.date).toISOString().split('T')[0];
    amountPerDay[date] = (amountPerDay[date] || 0) + t.totalAmount;
  });

  processed.forEach(p => {
    const date = new Date(p.dateProcessed).toISOString().split('T')[0];
    amountPerDay[date] = (amountPerDay[date] || 0) + p.adjustedTotal;
  });

 
  const processedCount = processed.length;
  const unprocessedCount = unprocessedPatients.size;

 
  let totalAmount = 0;
  let discountedAmount = 0;
  processed.forEach(p => {
    totalAmount += p.originalTotal;
    discountedAmount += (p.originalTotal - p.adjustedTotal);
  });

  res.json({
    patientPerDay,
    transactionsPerDay,  
    amountPerDay,
    processedCount,
    unprocessedCount,
    totalAmount,
    discountedAmount
  });
});


app.get('/register', async (req, res) => {
  
  const generateStaffId = () => {
    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `${year}-${randomStr}`;
  };

  const staffId = generateStaffId();

  try {
   
    const staff = await Staff.find();

    
    res.render('register', { staffId, staff }); 
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).send('Error loading register page');
  }
});



app.post('/register', async (req, res) => {
  const { staffId, firstName, middleInitial, surname, birthday, address, email, password } = req.body;

  try {
    const newStaff = new Staff({
      staffId,
      firstName,
      middleInitial,
      surname,
      birthday,
      address,
      email,
      password 
    });

    await newStaff.save();
    res.redirect('/register');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Error registering staff.');
  }
});


app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

 
  if (role === 'admin') {
    if (email === 'admin@gmail.com' && password === 'admin1234') {
      req.session.user = { email, role: 'admin' };
      return res.redirect('/index'); 
    } else {
      return res.send('Invalid admin credentials.');
    }
  }

  
  if (role === 'staff') {
    try {
      const staff = await Staff.findOne({ email, password }); 
      if (!staff) {
        return res.send('Invalid staff credentials.');
      }

      req.session.user = { email, role: 'staff', staffId: staff.staffId };
      return res.redirect('/index'); 
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Login failed.');
    }
  } else {
    res.send('Invalid login role.');
  }

});
app.get('/login', (req, res) => {
  res.render('login'); 
});

app.get('/void', async (req, res) => {
  try {
    const transactions = await Transaction.find(); 
    res.render('void', { transactions }); 
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/void-transaction', async (req, res) => {
  try {
    const { selectedTransactions, adminPassword } = req.body;

    if (adminPassword !== 'admin1234') {
      return res.status(403).send('Invalid Admin Password');
    }

    if (!selectedTransactions || selectedTransactions.length === 0) {
      return res.status(400).send('No transactions selected');
    }

    const transactionIds = Array.isArray(selectedTransactions) ? selectedTransactions : [selectedTransactions];

    for (let transactionId of transactionIds) {
      const transaction = await Transaction.findById(transactionId);
      if (transaction) {
        const voidTransaction = new VoidTransaction(transaction.toObject());
        await voidTransaction.save();
        await Transaction.findByIdAndDelete(transactionId);
      }
    }

    res.redirect('/void');
  } catch (err) {
    console.error('Error voiding transactions:', err);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/voidtransaction', async (req, res) => {
  try {
    const voidTransactions = await VoidTransaction.find().sort({ date: -1 });
    res.render('voidtransaction', { voidTransactions });
  } catch (err) {
    console.error('Error loading voided transactions:', err);
    res.status(500).send('Internal Server Error');
  }
});
