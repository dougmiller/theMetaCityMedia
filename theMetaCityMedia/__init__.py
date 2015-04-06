from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.admin import Admin
from flask.ext.admin.contrib.sqla import ModelView

app = Flask(__name__)
app.config.from_object('config')
admin = Admin(app, name='TheMetaCity Media')
db = SQLAlchemy(app)

from theMetaCityMedia import models

admin.add_view(ModelView(models.Licence, db.session, 'Licences'))
admin.add_view(ModelView(models.VideoFile, db.session, 'Video Files'))
admin.add_view(ModelView(models.AudioFile, db.session, 'Audio Files'))
admin.add_view(ModelView(models.VideoTrack, db.session, 'Video Tracks'))
admin.add_view(ModelView(models.AudioTrack, db.session, 'Audio Tracks'))
admin.add_view(ModelView(models.Video, db.session, 'Video'))
admin.add_view(ModelView(models.Audio, db.session, 'Audio'))
admin.add_view(ModelView(models.Picture, db.session, 'Pictures'))
admin.add_view(ModelView(models.Code, db.session, 'Code'))

