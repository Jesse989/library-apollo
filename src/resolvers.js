const { paginateResults } = require('./utils');

module.exports = {
  Query: {
    findBooks: async (_, { query }, { dataSources }) => {
      const books = await dataSources.bookAPI.findBooks({ query });
      if (!books) {
        return {
          success: false,
          message: 'failed to find books'
        }
      }
      return {
        success: true,
        message: 'found books',
        books
      }
    },
    bookByTitle: async(_, { bookTitle }, { dataSources }) => (
      dataSources.bookAPI.getBookByTitle({ bookTitle })
    ),
    me: async (_, __, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser();

      return {
        id: user.dataValues.id,
        email: user.dataValues.email,
      }
    }
  },
  Mutation: {
    addBook: async (_, { bookTitle }, { dataSources }) => {
      const result = await dataSources.userAPI.addBook({ bookTitle });
      if (!result)
        return {
          success: false,
          message: 'failed to add book',
        }

      const bookTitles = await dataSources.userAPI.getBookTitles();

      const books = await dataSources.bookAPI.getBooksByTitles({ bookTitles });

      return {
        success: true,
        message: 'succesfully added book',
        books,
      };
    },
    addComment: async (_, { bookTitle, body }, { dataSources }) => {
      const result = await dataSources.commentAPI.addComment({ bookTitle, body });
      if (!result) {
        return {
          success: false,
          message: 'failed to add comment',
        };
      }
      const comments = dataSources.commentAPI.getBookComments({ bookTitle });
      return {
        success: true,
        message: 'added comment',
        comments
      }
    },
    removeBook: async (_, { bookTitle }, { dataSources }) => {
      const result = dataSources.userAPI.removeBook({ bookTitle });

      if (!result)
        return {
          success: false,
          message: 'failed to remove book'
        };
      const book = await dataSources.bookAPI.getBookByTitle({ bookTitle });

      return {
        success: true,
        message: 'book removed',
        books: [book],
      };
    },
    removeComment: async (_, { commentId }, { dataSources }) => {
      const result = dataSources.commentAPI.removeComment({ commentId });

      if (!result) {
        return {
          success: false,
          message: 'failed to remove comment',
        };
      }

      return {
        success: true,
        message: 'removed comment',
      }
    },
    login: async (_, { email, password }, { dataSources }) =>
      dataSources.userAPI.authenticate({ email, password }),
    signup: async (_, { email, password }, { dataSources }) => {
      const newUser = await dataSources.userAPI.findOrCreateUser({ email });

      if (!newUser._options.isNewRecord) return null;
      return dataSources.userAPI.createToken({ userId: newUser.dataValues.id, password });

    }
  },
  User: {
    books: async (_, __, { dataSources }) => {
      const bookTitles = await dataSources.userAPI.getBookTitles();
      if(!bookTitles.length) return [];

      return (
        dataSources.bookAPI.getBooksByTitles({ bookTitles }) || []
      );
    },
  },
  Book: {
    comments: async ( book, __, { dataSources }) =>
      dataSources.commentAPI.getBookComments({ bookTitle: book.title }),
    inLibrary: async ( book, __, { dataSources }) =>
      dataSources.userAPI.checkLibrary({ bookTitle: book.title }),
  }
};
