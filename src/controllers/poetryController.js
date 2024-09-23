const {
  getAll,
  getById,
  create,
  update,
  remove,
  getByField,
} = require("../services/poetryService");
const User = require("../models/userModel");

const getPoems = async (req, res) => {
  try {
    const poems = await getAll().sort({ createdAt: -1 }).lean();
    if (poems.length === 0) {
      return res
        .status(400)
        .send({ success: false, msg: "Poems are not found" });
    }

    const validPoems = [];
    for (let poem of poems) {
      const authorExists = await User.findById(poem.authorId);
      if (!authorExists) {
        await remove(poem._id);
      } else {
        validPoems.push(poem);
      }
    }

    return res.status(200).send({ success: true, data: validPoems });
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const getPoemById = async (req, res) => {
  try {
    const { id } = req.params;

    const poem = await getById(id);

    if (!poem) {
      return res
        .status(400)
        .send({ success: false, msg: "Poem is not found by ID" });
    }

    const authorExists = await User.findById(poem.authorId);
    if (!authorExists) {
      await remove(id);
      return res.status(400).send({
        success: false,
        msg: "Author no longer exists, and the poem has been deleted.",
      });
    }

    return res.status(200).send({ success: true, data: poem });
  } catch (error) {
    return res.status(404).send({ success: false, msg: error });
  }
};

const getPoemByAuthorId = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getByField({ authorId: id }).sort({ createdAt: -1 });

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

const getFavouritePoems = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getAll().lean();

    const allPoems = response.filter((poem) =>
      poem.likes.some((like) => like.userId.toString() === id.toString())
    );
    if (allPoems) {
      return res.status(200).send({ success: true, data: allPoems });
    } else {
      return res.status(400).send({
        success: false,
        msg: "Favourite poems are not found by AuthorId",
      });
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
      authorId: req.user.id,
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
    if (req.user.id.toString() !== poemById.authorId._id.toString()) {
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
    if (
      req.user.role !== "admin" &&
      req.user.role !== "super-admin" &&
      req.user.id.toString() !== poemById.authorId._id.toString()
    ) {
      return res.status(400).send({
        msg: "The author does not match the person logged in or you are not an admin",
      });
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
    if (userId.toString() === poemById.authorId._id.toString()) {
      return res.status(400).send({ msg: "The author can't like own poem" });
    }

    const userLike = poemById.likes.find(
      (like) => like.userId.toString() === userId.toString()
    );

    let updatedPoem;
    if (userLike) {
      updatedPoem = await update(
        { _id: poemId },
        { $pull: { likes: { userId: userId } } }
      );
      return res.status(200).json({
        message: "Poem successfully unliked the poem",
        success: true,
        data: updatedPoem,
      });
    } else {
      const likeData = { userId, date: new Date() };
      updatedPoem = await update(
        { _id: poemId },
        { $addToSet: { likes: likeData } }
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
  getFavouritePoems,
};
