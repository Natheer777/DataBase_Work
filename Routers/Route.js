const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const NodeCache = require('node-cache');

const UserController = require('../Controllers/Usecontroller');

router.get('/allusers', UserController.getAllUsers);
router.post('/allWords', UserController.searchWords);
router.post('/addusers', UserController.addUser);
router.post('/delete', UserController.deleteUser);
router.post('/edite', UserController.editUser);
router.post('/insertWords', UserController.insertWords);
// router.get('/getSentence', UserController.getSentence)
router.post('/addSuggestions', UserController.addSuggestions)
router.get('/getSuggestions', UserController.getSuggestions)
router.delete('/deleteSuggestions/:id', UserController.deleteSuggestions)

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
router.get('/getSentence', async (req, res) => {
    try {
      const cacheKey = 'sentenceDataEncrypted';
      const cachedData = cache.get(cacheKey);
  
      if (cachedData) {
        return res.json({ data: cachedData });
      }
  
      const sentenceData = await UserController.getSentence(req, res); // Pass req and res if needed
  
      if (!sentenceData) {
        throw new Error('No sentence data found.');
      }
  
      const secretKey = 'sawa2020!';
      const encryptedResult = CryptoJS.AES.encrypt(JSON.stringify(sentenceData), secretKey).toString();
  
      cache.set(cacheKey, encryptedResult);
      res.json({ data: encryptedResult });
    } catch (error) {
      console.error('Error fetching or processing sentence data:', error.message);
      res.status(500).send('Error fetching or processing sentence data.');
    }
  });
  
  

module.exports = router;

