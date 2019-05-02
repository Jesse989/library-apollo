const { RESTDataSource } = require('apollo-datasource-rest');
const parseString = require('xml2js').parseString;


class BookAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://www.goodreads.com/';
  }

  bookReducer(book) {
    return {
      id: book.id[0]._,
      img: book.best_book[0].image_url[0],
      author: {
        id: book.best_book[0].author[0].id[0]._,
        name: book.best_book[0].author[0].name[0],
        img: ''
      },
      title: book.best_book[0].title[0],
      published: book.original_publication_year[0]._,
      rating: Math.floor(Number(book.average_rating[0]) * 100),
    }
  }

  parseXml(string) {
    return new Promise(function(resolve, reject) {
      parseString(string, function(err, result){
           if(err){
               reject(err);
           }
           else {
               resolve(result);
           }
      });
    });
  }


  async findBooks({ query }) {
    const res = await this.get('search/index.xml', {
      key: process.env.BOOK_KEY,
      q: query,
    });

    const parsedRes = await this.parseXml(res);
    const books = parsedRes.GoodreadsResponse.search[0].results[0].work;

    return Array.isArray(books)
      ? books.map(book => this.bookReducer(book)) : [];

  }


  async getBooksByTitles({ bookTitles }) {
    let books = [];
    for (const bookTitle in bookTitles) {
      const res = this.getBookByTitle({ bookTitle: bookTitles[bookTitle] });
      if (res) books.push(res);
    }

    return books;
  }


  async getBookByTitle({ bookTitle }) {
    const res = await this.get('search/index.xml', {
      key: process.env.BOOK_KEY,
      q: bookTitle,
      search: 'title',
    });

    const parsedBook = await this.parseXml(res);
    const book = parsedBook.GoodreadsResponse.search[0].results[0].work[0];
    return this.bookReducer(book);
  }

}

module.exports = BookAPI;
