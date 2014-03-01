from videotmc import db


class Licences(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    licence_name = db.Column(db.String(64), unique=True)
    licence_text = db.Column(db.String(64), unique=True)
    licence_URL = db.Column(db.String(64), unique=True)
    videos = db.relationship('Video', backref='videos', lazy='dynamic')

    def __repr__(self):
        return '<License %r>' % (self.licence_name)


class Codecs(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codec = db.Column(db.String(16))
    videos = db.relationship('VideoFile', backref='videos', lazy='dynamic')

    def __repr__(self):
        return '<Codec %r>' % (self.codec)

class VideoFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    parent_video = db.Column(db.Integer, db.ForeignKey('video.id'))
    codec = db.Column(db.Integer, db.ForeignKey('codecs.id'))
    resolution = db.Column(db.String(16))
    is_fullscreen = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return '<VideoFile %r>' % (self.id)


class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64), index=True, unique=True)
    about = db.Column(db.String(512), index=True)
    file_name = db.Column(db.String(64), index=True, unique=True)
    files = db.relationship('VideoFile', backref='video_files', lazy='dynamic')
    running_time = db.Column(db.String(64), index=True)
    has_poster = db.Column(db.Boolean, default=True)
    date_published = db.Column(db.Date)
    licence = db.Column(db.Integer, db.ForeignKey('licences.id'))

    def __repr__(self):
        return '<Video %r>' % (self.title)