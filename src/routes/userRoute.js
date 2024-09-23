const router = require("express").Router();
const {
  login,
  register,
  checkToken,
  getUserById,
  updateUserById,
  authenticateToken,
  authenticateSuperAdminToken,
  authenticateAdminToken,
  deleteUserById,
  updateAdminById,
  getUsers,
} = require("../controllers/userController");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/checkToken").get(checkToken);
router.route("/user").get(authenticateAdminToken, getUsers);
router
  .route("/user/:id")
  .get(getUserById)
  .put(authenticateToken, updateUserById)
  .delete(authenticateAdminToken, deleteUserById);

router.route("/admin/:id").put(authenticateSuperAdminToken, updateAdminById);

module.exports = router;
