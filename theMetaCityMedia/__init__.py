from flask import Flask
from flask.ext.admin import Admin
from flask.ext.admin.contrib.sqla import ModelView
from media import media
from api_home import api_home
from api_1_0 import api_1_0


def create_app(config_file):
    from models import db
    import models
    app = Flask(__name__)
    app.config.from_object(config_file)
    app.url_map.default_subdomain = "media"
    app.register_blueprint(media)
    app.register_blueprint(api_home)
    app.register_blueprint(api_1_0)
    db.init_app(app)

    admin = Admin(app, name='TheMetaCity Media')
    admin.add_view(ModelView(models.MediaItem, db.session, 'Media Items'))
    admin.add_view(ModelView(models.VideoFile, db.session, 'Video Files'))
    admin.add_view(ModelView(models.VideoTrack, db.session, 'Video Tracks'))
    admin.add_view(ModelView(models.Video, db.session, 'Video'))
    admin.add_view(ModelView(models.AudioFile, db.session, 'Audio Files'))
    admin.add_view(ModelView(models.AudioTrack, db.session, 'Audio Tracks'))
    admin.add_view(ModelView(models.Audio, db.session, 'Audio'))
    admin.add_view(ModelView(models.Picture, db.session, 'Pictures'))
    admin.add_view(ModelView(models.Tags, db.session, 'Tags'))
    admin.add_view(ModelView(models.Code, db.session, 'Code'))
    admin.add_view(ModelView(models.Postcards, db.session, 'Postcards'))
    admin.add_view(ModelView(models.Licence, db.session, 'Licences'))

    return app
