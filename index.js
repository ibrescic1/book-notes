import pg from "pg";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    const search = req.query.search || "";
    const sort = req.query.sort || "date";

    let orderBy = "date_read DESC";

    if (sort === "rating_desc") {
        orderBy = "rating DESC NULLS LAST";
    }
    else if (sort === "rating_asc") {
        orderBy = "rating ASC NULLS LAST";
    }
    else if (sort === "title") {
        orderBy = "title ASC";
    }

    try {
        const result = await db.query(
            `SELECT * FROM books ORDER BY ${orderBy}`
        );

        const books = result.rows;

        let searchResults = [];

        if (search.trim() !== "") {

            const response = await axios.get(
                "https://openlibrary.org/search.json",
                {
                    params: {
                        q: search,
                        limit: 10
                    }
                }
            );

            searchResults = response.data.docs.map(book => ({
                title: book.title,
                author: book.author_name ? book.author_name[0] : "Unknown",
                isbn: book.isbn ? book.isbn[0] : "",
                cover_id: book.cover_i || null
            }));
        }

        res.render("index", {
            books,
            searchResults,
            search,
            sort,
            editBook: null
        });

    } 
    catch (err) {
        console.error("Error:", err);
        res.status(500).send("Something went wrong");
    }
});

app.get("/books/:id", async (req, res) => {
    const bookId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM books WHERE id = $1", [bookId]);
        const book = result.rows[0];
        if (!book) {
            res.status(404).send("Book not found");
            return;
        }
        res.render("book", { book });
    } catch (err) {
        console.error("Error fetching book:", err);
        res.status(500).send("Error fetching book");
    }
});

app.get("/books/edit/:id", async (req, res) => {
    const bookId = req.params.id;

    try {
        const result = await db.query(
            "SELECT * FROM books WHERE id = $1",
            [bookId]
        );

        const editBook = result.rows[0];

        if (!editBook) {
            return res.status(404).send("Book not found");
        }

        const booksResult = await db.query(
            "SELECT * FROM books ORDER BY date_read DESC"
        );

        res.render("index", {
            books: booksResult.rows,
            searchResults: [],
            search: "",
            sort: "date",
            editBook
        });

    } catch (err) {
        console.error("Error fetching book for edit:", err);
        res.status(500).send("Error fetching book");
    }
});

app.post("/books/add", async (req, res) => {
    const { title, author, isbn, cover_id, rating, notes, date_read } = req.body;
    const coverId = req.body.cover_id === "" ? null : req.body.cover_id;
    try{
        await db.query("INSERT INTO books (title, author, isbn, cover_id, rating, notes, date_read) VALUES ($1, $2, $3, $4, $5, $6, $7)", [title, author, isbn, coverId, rating, notes, date_read]);
        res.redirect("/");
    }
    catch (err) {
        console.error("Error adding book:", err);
        res.status(500).send("Error adding book");
    }
});

app.post("/books/update/", async (req, res) => {
    const { id, rating, notes, date_read } = req.body;
    try {
        await db.query("UPDATE books SET rating = $1, notes = $2, date_read = $3 WHERE id = $4", [rating, notes, date_read, id]);
        res.redirect("/");
    }
    catch (err) {
        console.error("Error updating book:", err);
        res.status(500).send("Error updating book");
    }
});

app.post("/books/delete/", async (req, res) => {
    const { id } = req.body;   
    try {
        await db.query("DELETE FROM books WHERE id = $1", [id]);
        res.redirect("/");
    }
    catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).send("Error deleting book");
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
