const {
  getAll,
  getById,
  create,
  update,
  remove,
  getByField,
} = require("../services/poetryService");

const getPoems = async (req, res) => {
  try {
    const response = await getAll().lean();

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

const getPoemByAuthorId = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getByField({ author: id });

    if (response) {
      return res.status(200).send({ success: true, data: response });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Poems are not found by AuthorId" });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const createPoem = async (req, res) => {
  try {
    const { title, poem } = req.body;
    const whitespaceRegex = /^\s*$/;

    if (whitespaceRegex.test(title) || whitespaceRegex.test(poem)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const createdPoem = await create({
      title,
      author: req.user.id,
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

    const poemById = await getById(req.params.id);

    if (!poemById) {
      return res.status(400).send({ msg: "The poem doesn't exist" });
    }

    if (req.user.id !== poemById.author) {
      return res
        .status(400)
        .send({ msg: "The author does not match the person logged in" });
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
    const poemById = await getById(req.params.id);

    if (!poemById) {
      return res.status(400).send({ msg: "The poem doesn't exist" });
    }

    if (req.user.id !== poemById.author) {
      return res
        .status(400)
        .send({ msg: "The author does not match the person logged in" });
    }

    const deletedRes = await remove(req.params.id);
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

const likePoemById = async (req, res) => {
  try {
    const poemId = req.params.id;
    const userId = req.user.id;

    const poemById = await getById(poemId);
    if (!poemById) {
      return res.status(400).send({ msg: "The poem doesn't exist" });
    }

    if (userId.toString() === poemById.author.toString()) {
      return res.status(400).send({ msg: "The author can't like own poem" });
    }

    let updatedPoem;
    if (poemById.likes.includes(userId.toString())) {
      updatedPoem = await update({ _id: poemId }, { $pull: { likes: userId } });
      return res.status(200).json({
        message: "Poem successfully unliked the poem",
        success: true,
        data: updatedPoem,
      });
    } else {
      updatedPoem = await update(
        { _id: poemId },
        { $addToSet: { likes: userId } }
      );
      return res.status(200).json({
        message: "Poem successfully liked the poem",
        success: true,
        data: updatedPoem,
      });
    }
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

module.exports = {
  getPoems,
  getPoemById,
  getPoemByAuthorId,
  createPoem,
  updatePoemById,
  deletePoemById,
  likePoemById,
};
