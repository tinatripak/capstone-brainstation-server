const Poetry = require("../models/poetryModel");

const getAll = () => {
  return Poetry.find({}).populate("authorId", "firstName lastName");
};

const getById = (id) => {
  return Poetry.findById(id).populate("authorId", "firstName lastName");
};

const getByField = (field) => {
  return Poetry.find(field);
};

const create = (newValue) => {
  const createdPoem = new Poetry(newValue);
  return createdPoem.save();
};

const update = (id, updatedValue) => {
  return Poetry.findOneAndUpdate(id, updatedValue, {
    upsert: true,
    new: true,
  });
};

const remove = (id) => {
  return Poetry.findByIdAndDelete(id);
};

module.exports = {
  getAll,
  getById,
  getByField,
  create,
  update,
  remove,
};
