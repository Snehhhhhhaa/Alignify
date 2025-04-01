// backend/server.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // Replace with your service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Alignify Backend is running!');
});

// Save posture data
app.post('/save-posture-data', async (req, res) => {
  try {
    const { userId, shoulderSlope, hipSlope, isGoodPosture, recommendation } = req.body;

    if (!userId || !shoulderSlope || !hipSlope || isGoodPosture === undefined || !recommendation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const postureData = {
      userId,
      shoulderSlope,
      hipSlope,
      isGoodPosture,
      recommendation,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    await db.collection('postureData').add(postureData);
    res.status(200).json({ message: 'Posture data saved successfully' });
  } catch (error) {
    console.error('Error saving posture data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get posture data for a user
app.get('/posture-data/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const snapshot = await db.collection('postureData').where('userId', '==', userId).get();
    const postureData = [];
    snapshot.forEach((doc) => {
      postureData.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(postureData);
  } catch (error) {
    console.error('Error fetching posture data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});