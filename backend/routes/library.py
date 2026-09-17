from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from extensions import db
from models.library import Library
from models.book import Book

library = Blueprint("library", __name__)


@library.route("/library/<int:book_id>", methods=["POST"])
@login_required
def add_to_library(book_id):
    book = Book.query.get(book_id)

    if not book:
        return jsonify({
            "message": "Book not found"
        }), 404

    existing = Library.query.filter_by(
        user_id=current_user.id,
        book_id=book_id
    ).first()

    if existing:
        return jsonify({
            "message": "Book already in your library"
        }), 409

    library_item = Library(
        user_id=current_user.id,
        book_id=book_id
    )

    db.session.add(library_item)
    db.session.commit()

    return jsonify({
        "message": "Book added to library"
    }), 201

@library.route("/library", methods=["GET"])
@login_required
def get_library():
    library_items = Library.query.filter_by(
        user_id=current_user.id
    ).all()

    books_data = []

    for item in library_items:
        book = Book.query.get(item.book_id)

        if book:
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

@library.route("/library/<int:book_id>", methods=["DELETE"])
@login_required
def remove_from_library(book_id):
    library_item = Library.query.filter_by(
        user_id=current_user.id,
        book_id=book_id
    ).first()

    if not library_item:
        return jsonify({
            "message": "Book is not in your library"
        }), 404

    db.session.delete(library_item)
    db.session.commit()

    return jsonify({
        "message": "Book removed from library"
    }), 200