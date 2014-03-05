from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.admin import Admin
from flask.ext.admin.contrib.sqla import ModelView

app = Flask(__name__)
app.config.from_object('config')
admin = Admin(app, name='TheMetaCity Media')
db = SQLAlchemy(app)

from theMetaCityMedia import views, models

admin.add_view(ModelView(models.Licence, db.session, 'Licences'))
admin.add_view(ModelView(models.AudioCodec, db.session, 'Audio Codecs'))
admin.add_view(ModelView(models.VideoCodec, db.session, 'Video Codecs'))
admin.add_view(ModelView(models.MimeType, db.session, 'Mime Types'))
admin.add_view(ModelView(models.VideoFile, db.session, 'Video Files'))
admin.add_view(ModelView(models.Track, db.session, 'Tracks'))
admin.add_view(ModelView(models.Video, db.session, 'Videos'))

