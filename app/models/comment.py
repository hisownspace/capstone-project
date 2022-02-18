from .db import db
from datetime import datetime

class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey("songs.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    content = db.Column(db.String(1000))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now())

    user = db.relationship("User", back_populates="comments")
    song = db.relationship("Song", back_populates="comments")

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user.to_dict(),
            "song": self.song.to_dict(),
            "content": self.content,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }