const router = require("express").Router();
const {
  getPoems,
  getPoemById,
  createPoem,
  updatePoemById,
  deletePoemById,
  likePoemById,
  getPoemByAuthorId,
} = require("../controllers/poetryController");
const { authenticateToken } = require("../controllers/userController");

router.route("/").get(getPoems).post(authenticateToken, createPoem);

router
  .route("/:id")
  .get(getPoemById)
  .put(authenticateToken, updatePoemById)
  .delete(authenticateToken, deletePoemById);

router.route("/:id/like").put(authenticateToken, likePoemById);
router.route("/author/:id").get(getPoemByAuthorId);

module.exports = router;
