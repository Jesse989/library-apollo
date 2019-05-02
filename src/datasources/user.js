const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');
const bcrypt = require('bcrypt');

class UserAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }

  async authenticate({ email, password }) {
    const users = await this.store.user.findOrCreate({ where: { email } });
    const token = users[0] && users[0].dataValues.token ? users[0].dataValues.token : null;

    if (!token) return null;

    const match = await bcrypt.compare(password, token);
    if (!match) return null;

    return token;
  }


  async createToken({ userId, password }) {
    const saltRounds = 10;

    const token = await bcrypt.hash(password, saltRounds);
    const user = this.store.user.update({ token }, {
      where: { id: userId }
    });
    if (!user) return null;

    return token;
  }

  async findOrCreateUser({ email: emailArg } = {}) {
    const email =
      this.context && this.context.user ? this.context.user.email : emailArg;
    if (!email || !isEmail.validate(email)) return null;

    const users = await this.store.user.findOrCreate({ where: { email } });
    return users && users[0] ? users[0] : null;
  }

  async addBooks({ bookIds }) {
    const userId = this.context.user.id;
    if (!userId) return;

    let results = [];

    for (const bookId of bookIds) {
      const res = await this.addBook({ bookId });
      if (res) results.push(res);
    }

    return results;
  }

  async addBook({ bookTitle }) {
    const userId = this.context.user.id;
    const res = await this.store.book.findOrCreate({
      where: { userId, bookTitle },
    });
    return res && res.length ? res[0].get() : false;
  }

  async removeBook({ bookTitle }) {
    const userId = this.context.user.id;
    return !!this.store.book.destroy({ where: { userId, bookTitle } });
  }

  async checkLibrary({ bookTitle }) {
    const userId = this.context.user.id;
    const res = await this.store.book.findOne({
      where: { userId, bookTitle },
    });

    return !!res;

  }

  async getBookTitles() {
    const userId = this.context.user.id;
    const found = await this.store.book.findAll({
      where: { userId },
    });

    return found && found.length
      ? found.map(t => t.dataValues.bookTitle)
      : [];
  }
}

module.exports = UserAPI;
