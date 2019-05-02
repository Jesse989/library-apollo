const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    findBooks(
      query: String!
    ): BookUpdateResponse!
    bookByTitle(bookTitle: String!): Book
    me: User
  }

  type Mutation {
    addBook(bookTitle: String!): BookUpdateResponse!
    removeBook(bookTitle: String!): BookUpdateResponse!
    login(email: String!, password: String!): String
    signup(email: String!, password: String!): String
    addComment(bookTitle: String!, body: String!): CommentUpdateResponse!
    removeComment(commentId: ID!): CommentUpdateResponse!
  }

  type CommentUpdateResponse {
    success: Boolean!
    message: String
    comments: [Comment]
  }

  type BookUpdateResponse {
    success: Boolean!
    message: String
    books: [Book]
  }

  type Book {
    id: ID!
    img: String
    author: Author!
    title: String!
    published: String
    rating: Int
    comments: [Comment]
    inLibrary: Boolean!
  }

  type User {
    id: ID!
    email: String!
    books: [Book]!
  }

  type Comment {
    id: ID!
    body: String!
    createdAt: String!
    updatedAt: String!
    userId: ID!
    rating: Int
  }

  type Author {
    id: ID!
    name: String
    img: String
  }`;


module.exports = typeDefs;
