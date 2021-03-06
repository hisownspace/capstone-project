from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Email, ValidationError
from app.models import User


def user_exists(form, field):
    # Checking if user exists
    username = field.data
    if not username:
        raise ValidationError('This field is required.')
    user = User.query.filter(User.username == username).first()
    if not user:
        user = User.query.filter(User.email == username).first()
        if not user:
            raise ValidationError('Username provided not found.')


def password_matches(form, field):
    # Checking if password matches
    password = field.data
    username = form.data['username']
    # if not username:
    #     raise ValidationError('Username provided not found.')
    if not password:
        raise ValidationError('This field is required.')
    user = User.query.filter(User.username == username).first()
    if not user:
        user = User.query.filter(User.email == username).first()
        if not user:
            return
    if not user.check_password(password):
        raise ValidationError('Incorrect username/password combination.')


class LoginForm(FlaskForm):
    username = StringField('username', validators=[DataRequired(), user_exists])
    password = StringField('password', validators=[
                           DataRequired(), password_matches])
