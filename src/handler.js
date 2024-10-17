const { nanoid } = require('nanoid');
const books = require('./books');

const addBooksHandler = (request, h) => {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;
    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    if (!name) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      });
      response.code(400);
      return response;
    }
    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };
    if (readPage > pageCount) {
      const response = h.response({
        status: 'fail',
        message:
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      });
      response.code(400);
      return response;
    }
    books.push(newBook);
    const isSuccess = books.filter((b) => b.id === id).length > 0;
    if (isSuccess) {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });
      response.code(201);
      return response;
    }
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
  };
 const getAllBooksHandler = (req, h) => {
    const { name, reading, finished } = req.query;
    let filteredBooks = books;
    if (name) {
      filteredBooks = books.filter((b) =>
        b.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (reading !== undefined) {
      const isReading = books[reading] === "1";
      filteredBooks = books.filter((book) => book.reading === isReading);
    }
    if (finished !== undefined) {
      const isFinished = finished === "1" ? true : false;
  
      filteredBooks = books.filter((book) => book.finished === isFinished);
    }
    const selectedBooks = filteredBooks.map((b) => ({
      id: b.id,
      name: b.name,
      publisher: b.publisher,
    }));
    const dataBook = {
      status: "success",
      data: {
        books: selectedBooks || [],
      },
    };
    return h.response(dataBook).code(200);
  };

  const getBookByIdHandler = async (request, h) => {
    try {
        const { bookId } = request.params;
        const book = books.find((book) => book.id === bookId);

        if (book !== undefined) {
            return h.response({
                status: 'success',
                message: 'Buku dapat ditemukan',
                data: {
                    book,
                },
            }).code(200);
        }

        return h.response({
            status: 'fail',
            message: 'Buku tidak ditemukan',
        }).code(404);
    } catch (error) {
        return h.response({
            status: 'fail',
            message: error.message,
        }).code(500);
    }
};

  const editBookByIdHandler = async (request, h) => {
    try {
        const { bookId } = request.params;
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
        const updatedAt = new Date().toISOString();

        if (!name) {
            return h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. Mohon isi nama buku',
            }).code(400);
        }
        if (readPage > pageCount) {
            return h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            }).code(400);
        }

        const index = books.findIndex((book) => book.id === bookId);

        if (index !== -1) {
            const finished = readPage === pageCount;

            books[index] = {
                ...books[index],
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading,
                updatedAt,
                finished
            };

            return h.response({
                status: 'success',
                message: 'Buku berhasil diperbarui',
                data: {
                    book: books[index],
                }
            }).code(200);
        }

        return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
    } catch (error) {
        return h.response({
            status: 'fail',
            message: error.message,
        }).code(500);
    }
};

const deleteBookByHandler = async (request, h) => {
    try {
        const { bookId } = request.params;
        const index = books.findIndex((book) => book.id === bookId);

        if (index !== -1) {
            books.splice(index, 1);
            return h.response({
                status: 'success',
                message: 'Buku berhasil dihapus',
            }).code(200);
        } else {
            return h.response({
                status: 'fail',
                message: 'Buku gagal dihapus. Id tidak ditemukan',
            }).code(404);
        }
    } catch (error) {
        return h.response({
            status: 'fail',
            message: error.message,
        }).code(500);
    }
};

module.exports = { 
    addBooksHandler, 
    getAllBooksHandler, 
    editBookByIdHandler, 
    getBookByIdHandler, 
    deleteBookByHandler
 };