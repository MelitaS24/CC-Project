from flask import Blueprint, jsonify, request
from extensions import db
from models.book import Book
from services.storage_service import upload_file
from services.storage_service import generate_presigned_url
from flask_login import login_required, current_user
from flask import send_file

books = Blueprint("books", __name__)


@books.route("/books", methods=["GET"])
def get_books():
    search = request.args.get("search")
    author = request.args.get("author")
    genre = request.args.get("genre")

    query = Book.query

    if search:
        query = query.filter(
            db.or_(
                Book.title.ilike(f"%{search}%"),
                Book.author.ilike(f"%{search}%")
            )
        )

    if author:
        query = query.filter(
            Book.author.ilike(f"%{author}%")
        )

    if genre:
        query = query.filter(
            Book.genre.ilike(f"%{genre}%")
        )

    books_list = query.all()

    books_data = []

    for book in books_list:
        books_data.append({
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "genre": book.genre,
            "description": book.description,
            "cover_url": book.cover_url,
            "pdf_url": book.pdf_url
        })

    return jsonify({
        "books": books_data
    }), 200

@books.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    book = Book.query.get(book_id)

    if not book:
        return jsonify({
            "message": "Book not found"
        }), 404

    return jsonify({
        "book": {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "genre": book.genre,
            "description": book.description,
            "cover_url": book.cover_url,
            "pdf_url": book.pdf_url
        }
    }), 200

@books.route("/books", methods=["POST"])
@login_required
def add_book():

    if current_user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()

    title = data.get("title")
    author = data.get("author")
    genre = data.get("genre")
    description = data.get("description")
    cover_url = data.get("cover_url")
    pdf_url = data.get("pdf_url")
    cover_key = data.get("cover_key")
    pdf_key = data.get("pdf_key")

    if not title or not author or not genre:
        return jsonify({
            "message": "Title, author and genre are required"
        }), 400

    book = Book(
        title=title,
        author=author,
        genre=genre,
        description=description,
        cover_url=cover_url,
        pdf_url=pdf_url,
        cover_key=cover_key,
        pdf_key=pdf_key
    )

    db.session.add(book)
    db.session.commit()

    return jsonify({
        "message": "Book added successfully",
        "book": {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "genre": book.genre,
            "description": book.description,
            "cover_url": book.cover_url,
            "pdf_url": book.pdf_url,
            "cover_key": book.cover_key,
            "pdf_key": book.pdf_key
        }
    }), 201


@books.route("/books/upload", methods=["POST"])
@login_required
def upload_book_file():

    if current_user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    if "file" not in request.files:
        return jsonify({
            "message": "No file provided"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "message": "No file selected"
        }), 400

    content_type = file.content_type

    if content_type == "application/pdf":
        folder = "books/pdf"

    elif content_type in ["image/jpeg", "image/png", "image/webp"]:
        folder = "books/covers"

    else:
        return jsonify({
            "message": "Only PDF, JPG, PNG and WEBP files are allowed"
        }), 400

    s3_key = upload_file(
        file,
        file.filename,
        folder,
        content_type
    )

    return jsonify({
        "message": "File uploaded successfully",
        "s3_key": s3_key
    }), 201

@books.route("/books/<int:book_id>/read", methods=["GET"])
def read_book(book_id):
    book = Book.query.get(book_id)

    if not book:
        return jsonify({
            "message": "Book not found"
        }), 404

    if not book.pdf_key:
        return jsonify({
            "message": "PDF not available"
        }), 404

    pdf_url = generate_presigned_url(
        book.pdf_key,
        expiration=3600
    )

    return jsonify({
        "message": "Book PDF available",
        "pdf_url": pdf_url
    }), 200

@books.route("/books/<int:book_id>/download", methods=["GET"])
def download_book(book_id):
    book = Book.query.get(book_id)

    if not book:
        return jsonify({"message": "Book not found"}), 404

    if not book.pdf_key:
        return jsonify({"message": "PDF not available"}), 404

    pdf_url = generate_presigned_url(
        book.pdf_key,
        expiration=3600
    )

    return jsonify({
        "message": "Download link generated",
        "download_url": pdf_url
    }), 200

@books.route("/books/<int:book_id>", methods=["PUT"])
@login_required
def update_book(book_id):

    if current_user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    book = Book.query.get(book_id)

    if not book:
        return jsonify({"message": "Book not found"}), 404

    data = request.get_json()

    book.title = data.get("title", book.title)
    book.author = data.get("author", book.author)
    book.genre = data.get("genre", book.genre)
    book.description = data.get("description", book.description)
    book.cover_url = data.get("cover_url", book.cover_url)
    book.pdf_url = data.get("pdf_url", book.pdf_url)
    book.cover_key = data.get("cover_key", book.cover_key)
    book.pdf_key = data.get("pdf_key", book.pdf_key)

    db.session.commit()

    return jsonify({
        "message": "Book updated successfully"
    }), 200

@books.route("/books/<int:book_id>", methods=["DELETE"])
@login_required
def delete_book(book_id):

    if current_user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    book = Book.query.get(book_id)

    if not book:
        return jsonify({"message": "Book not found"}), 404

    db.session.delete(book)
    db.session.commit()

    return jsonify({
        "message": "Book deleted successfully"
    }), 200

