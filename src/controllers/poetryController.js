const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require("../services/poetryService");

const getPoems = async (req, res) => {
  try {
    const response = await getAll();

    if (response.length > 0) {
      return res.status(200).send({ success: true, data: response });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Poems are not found" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const getPoemById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await getById(id);

    if (response) {
      return res.status(200).send({ success: true, data: response });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Poem is not found by ID" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const createPoem = async (req, res) => {
  try {
    const { title, author, poem } = req.body;
    const nameRegex = /^[A-Z][a-zA-Z-' ]+$/;
    const whitespaceRegex = /^\s*$/;

    if (
      whitespaceRegex.test(title) ||
      whitespaceRegex.test(author) ||
      whitespaceRegex.test(poem)
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!nameRegex.test(author)) {
      return res.status(400).json({ message: "Invalid name of the author" });
    }

    const createdPoem = await create({
      title,
      author,
      poem,
    });

    return res.status(201).json({
      message: "Poem successfully created",
      success: true,
      data: createdPoem,
    });
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const updatePoemById = async (req, res) => {
  try {
    const { title, poem } = req.body;
    const whitespaceRegex = /^\s*$/;

    if (whitespaceRegex.test(title) || whitespaceRegex.test(poem)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedPoem = await update(
      { _id: req.params.id },
      {
        title,
        poem,
      }
    );

    return res.status(200).json({
      message: "Poem successfully updated",
      success: true,
      data: updatedPoem,
    });
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const deletePoemById = async (req, res) => {
  try {
    const deletedRes = await remove(req.params.id);
    console.log(deletedRes);
    if (deletedRes) {
      return res.status(200).send({
        success: true,
        msg: "The poem has been removed",
      });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Poem was not found" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

module.exports = {
  getPoems,
  getPoemById,
  createPoem,
  updatePoemById,
  deletePoemById,
};
