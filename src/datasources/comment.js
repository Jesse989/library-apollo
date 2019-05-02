const { DataSource } = require('apollo-datasource');

class CommentAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }

  async addComment({ bookTitle, body }) {
    const userId = this.context.user.id;
    const res = await this.store.comment.findOrCreate({
      where: { userId, bookTitle, body }
    });
    return res && res.length ? res[0].get() : false;
  }

  async removeComment({ commentId }) {
    const userId = this.context.user.id;
    return !!this.store.comment.destroy({ where: { userId, id: commentId }})
  }


  async getBookComments({ bookTitle }) {
    const found = await this.store.comment.findAll({
      where: { bookTitle },
      order: [
        ['createdAt', 'DESC'],
      ],
    });

    return found && found.length
      ? found.map(t => t.dataValues)
      : [];
  }

}

module.exports = CommentAPI;
