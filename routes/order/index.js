const express = require("express");
const router = express.Router();


router.use("/", require("./normal.js"));
router.use("/activity-log", require("./activityLog.js"));

console.log('Loaded order routes');
module.exports = router;
