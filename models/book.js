'use strict';
module.exports = (sequelize, DataTypes) => {
  const book = sequelize.define('book', {
    bookTitle: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  book.associate = function(models) {
    // associations can be defined here
  };
  return book;
};
