# Book Notes

A simple web application for keeping track of books you have read.

## Features

- Add books to your reading list
- Search for books using Open Library Search API
- Automatically retrieve book information and covers
- Add ratings, notes and reading dates
- Edit and delete books
- Sort books by date, title and rating
- View detailed information about each book

## Technologies

- Node.js
- Express.js
- PostgreSQL
- EJS
- Axios
- Open Library API
- HTML
- CSS
- JavaScript

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd book-notes
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=book_notes
DB_PASSWORD=your_password
DB_PORT=5432
PORT=3000
```

4. Create the PostgreSQL database and books table

5. Start the application

```bash
npm start
```

For development:

```bash
npm run dev
```

## Database

The application uses PostgreSQL to store book information, ratings, notes and reading dates.

## API

Book information and cover images are retrieved from the Open Library Search API.
