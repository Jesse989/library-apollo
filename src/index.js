require('dotenv').config();


const { ApolloServer } = require('apollo-server');
const isEmail = require('isemail');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const store = require('../models');

const BookAPI = require('./datasources/book');
const UserAPI = require('./datasources/user');
const CommentAPI = require('./datasources/comment');

const dataSources = () => ({
  bookAPI: new BookAPI(),
  userAPI: new UserAPI({ store }),
  commentAPI: new CommentAPI({ store }),
});

const context = async ({ req }) => {
  const token = (req.headers && req.headers.authorization) || '';

  if (!token) return { user: null };
  const user = await store.user.findOne({ where: { token } });
  return user ? { user: { ...user.dataValues } } : { user: null};
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context,
});

if (process.env.NODE_ENV !== 'test')
  server
    .listen({ port: 4000 })
    .then(({ url }) => console.log(`   app running at ${url}`));

module.exports = {
  dataSources,
  context,
  typeDefs,
  resolvers,
  ApolloServer,
  BookAPI,
  UserAPI,
  store,
  server,
};
