from extensions import db


class Book(db.Model):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(150), nullable=False)
    genre = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    cover_url = db.Column(db.String(500), nullable=True)
    pdf_url = db.Column(db.String(500), nullable=True)

    pdf_key = db.Column(db.String(500), nullable=True)
    cover_key = db.Column(db.String(500), nullable=True)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )