'use strict';
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    body: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    bookTitle: DataTypes.STRING,
    rating: DataTypes.INTEGER
  }, {});
  comment.associate = function(models) {
    // associations can be defined here
  };
  return comment;
};
