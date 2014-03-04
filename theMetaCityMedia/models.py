from theMetaCityMedia import db


class Licence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    licence_name = db.Column(db.String(64), unique=True)
    licence_text = db.Column(db.String(64), unique=True)
    licence_url = db.Column(db.String(64), unique=True)
    videos = db.relationship('Video', backref='licence_videos', lazy='dynamic')

    def __repr__(self):
        return '<License %r>' % self.licence_name


class VideoCodec(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codec = db.Column(db.String(16))
    videos = db.relationship('VideoFile', backref='video_codec_videos', lazy='dynamic')

    def __repr__(self):
        return '<Video Codec %r>' % self.codec

    def link_output(self):
        return self.codec


class AudioCodec(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codec = db.Column(db.String(16))
    videos = db.relationship('VideoFile', backref='audio_codec_videos', lazy='dynamic')

    def __repr__(self):
        return '<Audio Codec %r>' % self.codec

    def link_output(self):
        return self.codec


class MimeType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mime = db.Column(db.String(16))
    videos = db.relationship('VideoFile', backref='mime_videos', lazy='dynamic')

    def __repr__(self):
        return '<Mime %r>' % self.mime

    def link_output(self):
        return self.miem

class VideoFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    parent_video = db.Column(db.Integer, db.ForeignKey('video.id'))
    extention = db.Column(db.String(4))
    video_codec = db.Column(db.Integer, db.ForeignKey(VideoCodec.id))
    audio_codec = db.Column(db.Integer, db.ForeignKey(AudioCodec.id))
    mime_type = db.Column(db.Integer, db.ForeignKey(MimeType.id))
    resolution = db.Column(db.String(16))
    is_fullscreen = db.Column(db.Boolean, default=False)
    has_fullscreen = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return '<VideoFile %r>' % self.id

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]


class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Enum('subtitle', 'caption', 'description', 'chapters', 'metadata'))
    src_lang = db.Column(db.String(16))
    parent_video = db.Column(db.Integer, db.ForeignKey('video.id'))

    def __repr__(self):
        return '<Track %r %r %r>' % (self.parent_video, self.type, self.src_lang)

    def get_url(self, video):
        return video.file_name + '.' + self.type + '.' + self.src_lang + '.vtt'

    def get_description(self):
        return self.type.title() + ': ' + self.src_lang


class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64), index=True, unique=True)
    about = db.Column(db.String(512), index=True)
    file_name = db.Column(db.String(64), index=True, unique=True)
    files = db.relationship('VideoFile', backref='video_files', lazy='dynamic')
    tracks = db.relationship('Track', backref='track_files', lazy='dynamic')
    running_time = db.Column(db.String(64), index=True)
    has_poster = db.Column(db.Boolean, default=True)
    date_published = db.Column(db.Date)
    licence = db.Column(db.Integer, db.ForeignKey('licence.id'))
    resolution = db.Column(db.String(16))

    def __repr__(self):
        return '<Video %r>' % self.title

    def get_poster_url(self):
        return self.file_name + '.poster.svg'

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]