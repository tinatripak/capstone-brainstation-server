const router = require("express").Router();
const {
  getPoems,
  getPoemById,
  createPoem,
  updatePoemById,
  deletePoemById,
} = require("../controllers/poetryController");

router.route("/").get(getPoems).post(createPoem);

router
  .route("/:id")
  .get(getPoemById)
  .put(updatePoemById)
  .delete(deletePoemById);

module.exports = router;
