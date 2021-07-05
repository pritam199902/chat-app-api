const router = require('express').Router()
const Controller = require("./controller/index")

router.get('/', Controller.Hello)

module.exports = router