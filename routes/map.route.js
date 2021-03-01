const express = require("express");
const { getUsers, createStore } = require('../controllers/map.controller');


const router = express.Router();

// vauge feature idea -------------------



// --------------------------------

router.route('/users').get(getUsers).post(createStore);

module.exports = router