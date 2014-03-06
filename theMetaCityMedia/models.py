from theMetaCityMedia import db


class Licence(db.Model):
    __tablename__ = 'licence'
    id = db.Column(db.Integer, primary_key=True)
    licence_name = db.Column(db.String(64), unique=True)
    licence_text = db.Column(db.String(64), unique=True)
    licence_url = db.Column(db.String(64), unique=True)
    videos = db.relationship('Video', backref='Licence')

    def __repr__(self):
        return '%r' % self.licence_name.encode('utf-8')


class VideoFile(db.Model):
    __tablename__ = 'video_file'
    id = db.Column(db.Integer, primary_key=True)
    parent_video = db.Column(db.Integer, db.ForeignKey('video.id'))
    extention = db.Column(db.String(4), default="webm")
    video_codec = db.Column(db.Enum('mp4', 'ogv', 'webm', name='video_codec'), default='webm')
    audio_codec = db.Column(db.Enum('mp3', 'oga', name='audio_codec'), default='oga')
    mime_type = db.Column(db.Enum('mp4', 'ogv', 'webm', name='mime_type'), default='webm')
    resolution = db.Column(db.String(16))
    is_fullscreen = db.Column(db.Boolean, default=False)
    has_fullscreen = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return '<Video File %r>' % self.id

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]


class Track(db.Model):
    __tablename__ = 'track'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Enum('subtitle', 'caption', 'description', 'chapters', 'metadata', name='track_type'))
    src_lang = db.Column(db.String(16), default="en-AU")
    parent_video = db.Column(db.Integer, db.ForeignKey('video.id'))

    def __repr__(self):
        return '<Track %r %r %r>' % (self.parent_video, self.type.encode('utf-8'), self.src_lang.encode('utf-8'))

    def get_url(self, video):
        return video.file_name + '.' + self.src_lang + '.' + self.type + '.vtt'

    def get_description(self):
        return self.type.title() + ': ' + self.src_lang


class Video(db.Model):
    __tablename__ = 'video'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64), unique=True)
    about = db.Column(db.String(512))
    file_name = db.Column(db.String(64), unique=True)
    files = db.relationship('VideoFile', backref='File Parent')
    tracks = db.relationship('Track', backref='Track Parent')
    running_time = db.Column(db.String(64))
    has_poster = db.Column(db.Boolean)
    date_published = db.Column(db.Date)
    licence = db.Column(db.Integer, db.ForeignKey('licence.id'))
    resolution = db.Column(db.String(16))

    def __repr__(self):
        return self.title

    def get_poster_url(self):
        return self.file_name + '.poster.svg'

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]