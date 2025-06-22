
const mongoose = require('mongoose');
const TransactionType = require('./models/TransactionType'); 

const transactionTypesData = [
  {
    type: 'medicines',
    descriptions: [
      { name: 'Paracetamol', unitAmount: 10 },
      { name: 'Cotrimoxazole', unitAmount: 12 },
      { name: 'Metronidazole', unitAmount: 15 },
      { name: 'Ciprofloxacin', unitAmount: 20 },
      { name: 'Amoxicillin', unitAmount: 10 },
      { name: 'Amoxicillin', unitAmount: 10 },
      { name: 'Cloxacillin', unitAmount: 18 },
      { name: 'Mefenamic Acid', unitAmount: 15 },
      { name: 'Carbocisteine', unitAmount: 10 },
      { name: 'Salbutamol', unitAmount: 15 },
      { name: 'Ambroxol', unitAmount: 10 },
      { name: 'Loperamide', unitAmount: 5 },
      { name: 'Oral Rehydration Salt', unitAmount: 8 },
      { name: 'Cetirizine', unitAmount: 12 },
      { name: 'Loratadine', unitAmount: 15 },
      { name: 'Multivitamins', unitAmount: 10 },
      { name: 'Ferrous Sulfate + Folic Acid', unitAmount: 8 },
      { name: 'Ascorbic Acid', unitAmount: 6 },
      { name: 'Hyoscine N-butylbromide', unitAmount: 10 },
      { name: 'Antacid', unitAmount: 5 },  
      { name: 'Hydrite', unitAmount: 7 },
      { name: 'Zinc Sulfate', unitAmount: 5 },
      { name: 'Mupirocin Ointment', unitAmount: 30 },
      { name: 'Silver Sulfadiazine Cream', unitAmount: 35 },
      { name: 'Povidone-Iodine Solution', unitAmount: 20 },
      { name: 'Hydrocortisone Cream', unitAmount: 25 },
      { name: 'Betadine Gargle', unitAmount: 15 },
      { name: 'Paracetamol Suppository', unitAmount: 18 },
      { name: 'Salbutamol Nebule', unitAmount: 22 },
    ]
  },
  {
    type: 'radiology',
    descriptions: [
      { name: 'X-Ray', unitAmount: 100 },
      { name: 'CT Scan', unitAmount: 500 },
      { name: 'MRI', unitAmount: 800 },
      { name: 'Chest PA', unitAmount: 270 },
      { name: 'Chest PA/L Adult (2 views)', unitAmount: 500 },
      { name: 'Chest AP/L Pedia (2 views)', unitAmount: 500 },
      { name: 'Apicolordotic View', unitAmount: 275 },
      { name: 'Plain Abdomen', unitAmount: 250 },
      { name: 'Abdomen Upright/Supine (2 views)', unitAmount: 520 },
      { name: 'Shoulder AP', unitAmount: 250 },
      { name: 'Clavicle AP', unitAmount: 250 },
      { name: 'Arm AP/L (2 views)', unitAmount: 380 },
      { name: 'Elbow AP/L (2 views)', unitAmount: 380 },
      { name: 'Forearm AP/L (2 views)', unitAmount: 380 },
      { name: 'Wrist AP/L (2 views)', unitAmount: 380 },
      { name: 'Hand AP/O or AP/L (2 views)', unitAmount: 380 },
      { name: 'Pelvis AP', unitAmount: 300 },
      { name: 'Hip Joint AP', unitAmount: 300 },
      { name: 'Femur AP/L (2 views)', unitAmount: 400 },
      { name: 'Leg AP/L (2 views)', unitAmount: 400 },
      { name: 'Knee AP/L (2 views)', unitAmount: 400 },
      { name: 'Ankle AP/L (2 views)', unitAmount: 400 },
      { name: 'Foot AP/O or AP/L (2 views)', unitAmount: 400 },
      { name: 'Cervical Spine APL/L (2 views)', unitAmount: 400 },
      { name: 'Thoracic Cage', unitAmount: 275 },
      { name: 'Thoracolumbar AP/L (2 views)', unitAmount: 450 },
      { name: 'Lumbosacral AP/L (2 views)', unitAmount: 450 },
      { name: 'Skull AP/L (2 views)', unitAmount: 400 },
      { name: 'Paranasal Sunuses AP/L (3 views)', unitAmount: 400 },
      { name: 'Mandible (3 views)', unitAmount: 560 },
      { name: 'Nasal Bone/Soft Tissue (2 views)', unitAmount: 400 }      
    ]
  }
];

mongoose.connect('mongodb://127.0.0.1:27017/BillingHospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  await TransactionType.deleteMany({});
  await TransactionType.insertMany(transactionTypesData);
  console.log('Transaction types seeded successfully');
  mongoose.connection.close();
}).catch((err) => {
  console.error('Error seeding data:', err);
  mongoose.connection.close();
});
