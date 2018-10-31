const express = require('express');
const router = express.Router();

router.post('/test', (req, res, next) => {
            res.status(200).json({
                message: 'Hello'
            });
});

module.exports = router;