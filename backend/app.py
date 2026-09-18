from flask import Flask, render_template
from config import Config
from extensions import db, login_manager
from routes.admin import admin
# from services.storage_service import test_s3_connection

app = Flask(__name__)
app.config.from_object(Config)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024

db.init_app(app)

login_manager.init_app(app)
login_manager.login_view = "auth.login"

from models.user import User
from models.book import Book
from models.library import Library

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


from routes.auth import auth
from routes.books import books
from routes.library import library


app.register_blueprint(auth)
app.register_blueprint(books)
app.register_blueprint(library)
app.register_blueprint(admin)

@app.route("/")
def home():
    return render_template("books/index.html") 

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5001)
