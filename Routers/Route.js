const express = require('express');
const UserController = require('../Controllers/Usecontroller');
const router = express.Router();

router.get('/allusers', UserController.getAllUsers);
router.post('/allWords', UserController.searchWords);
router.post('/addusers', UserController.addUser);
router.post('/delete', UserController.deleteUser);
router.post('/edite', UserController.editUser);
router.post('/insertWords', UserController.insertWords);
router.get('/getSentence', UserController.getSentence)
router.post('/addSuggestions', UserController.addSuggestions)
router.get('/getSuggestions', UserController.getSuggestions)
router.delete('/deleteSuggestions/:id', UserController.deleteSuggestions)

module.exports = router;

