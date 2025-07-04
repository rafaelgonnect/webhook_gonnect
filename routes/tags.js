const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tagsController');

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Gestão de tags
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     tags: [Tags]
 *     summary: Lista tags
 *     responses:
 *       200:
 *         description: Lista de tags
 */
router.get('/', tagsController.listTags);

module.exports = router; 