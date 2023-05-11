process.env.NODE_ENV = "test";

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let book_isbn;

beforeEach(async () => {
    let res = await db.query(`
    insert into books (isbn, amazon_url, language, pages, publisher, title, year)
    values 
    ('123432122), 'https://amazon.com/taco', 'Elie', 'English', 100, 'Nothing Publishers', 'my first book', 2023)
    returning isbn`);
    book_isbn = res.rows[0].isbn;
});

describe('post /books', () => {
    test('creates a new book', async () => {
        const res = await request(app).post('/books').send({
            isbn: '32794782',
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "amazing times",
            year: 2000
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.book).toHaveProperty("isbn");
    });
    test('prevents creating book without required title', async () => {
        const res = await request(app).post('/books').send({
            year: 2000
        });
        expect(res.statusCode).toBe(400);
    });
});

describe('get /books', () => {
    test('gets a list of 1 book', async () => {
        const res = await request(app).get('/books');
        const books = res.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty('isbn');
        expect(books[0]).toHaveProperty('amazon_url');
    });
});

describe('get /books/:isbn', () => {
    test('gets a single book', async () => {
        const res = await request(app).get(`/books/${book_isbn}`);
        expect(res.body.book).toHaveProperty('isbn');
        expect(res.body.book_isbn).toBe(book_isbn);
    });
    test('responds with 404 if unable to find book isbn', async () => {
        const res = await request(app).get('/books/999');
        expect(res.statusCode).toBe(404);
    });
});

describe('put /books/:id', () => {
    test('updates a single book', async () => {
        const res = await request(app).put(`/books/${book_isbn}`).send({
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "updated book",
            year: 2000
        });
        expect(res.body.book).toHaveProperty('isbn');
        expect(res.body.book.title).toBe('updated book')
    });
    test('prevents a bad book update', async () => {
        const res = await request(app).put(`/books/${book_isbn}`).send({
            isbn: "32794782",
            badField: "DO NOT ADD ME!",
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
        });
        expect(res.statusCode).toBe(400);
    });
    test('responds with 404 if unable to find book', async () => {
        await request(app).delete(`/books/${book_isbn}`);
        expect(res.statusCode).toBe(404);
    });
});

describe('delete /books/:id', () => {
    test('deletes a single book', async () => {
        const res = await request(app).delete(`/books/${book_isbn}`);
        expect(res.body).toEqual({
            msg: 'Book deleted'
        });
    });
});

afterEach(async () => {
    await db.query('delete from books');
});

afterAll(async () => {
    await db.end();
});