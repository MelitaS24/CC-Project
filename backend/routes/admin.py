from flask import Blueprint, jsonify
from flask_login import login_required, current_user

admin = Blueprint("admin", __name__)

@admin.route("/admin/check", methods=["GET"])
@login_required
def admin_check():

    if current_user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    return jsonify({
        "message": "Admin access granted",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
    }), 200