const express = require("express");
const controller = require("../controllers/users.controller");
const router = express.Router();

router.post("/register", controller.addUser);
router.post("/login", controller.login);

router.get("/", controller.getAllUsers);
router.get("/groupe-sanguin/:groupe", controller.getUsersByBloodGroup);
router.get("/:id", controller.getUserById);

module.exports = router;
