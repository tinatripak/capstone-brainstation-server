const Poetry = require("../models/poetryModel");

const getAll = () => {
  return Poetry.find({});
};

const getById = (id) => {
  return Poetry.findById(id);
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
  create,
  update,
  remove,
};
