const router = require("express").Router();
const {
  login,
  register,
  checkToken,
} = require("../controllers/userController");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/checkToken").get(checkToken);

module.exports = router;
