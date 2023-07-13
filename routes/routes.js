const express = require('express');

const router = express.Router();
var employeeController = require('../src/employee/employeeController');

// router.post('/user/create', function(req, res) { employeeController.createUserControllerFn });
router.post('/user/create', function(req, res) {
    employeeController.createUserControllerFn(req, res);
  });
  router.get('/user/findOne', function(req, res) {
    employeeController.findOneUserController(req, res);
  });
module.exports = router;