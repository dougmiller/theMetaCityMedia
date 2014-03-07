from theMetaCityMedia import db


class Licence(db.Model):
    __tablename__ = 'licence'
    id = db.Column(db.Integer, primary_key=True)
    licence_name = db.Column(db.String(64), unique=True)
    licence_text = db.Column(db.String(128), unique=True)
    licence_url = db.Column(db.String(64), unique=True)
    videos = db.relationship('Video', backref='Licence')

    def __repr__(self):
        return self.licence_name


class VideoCodec(db.Model):
    __tablename__ = 'video_codec'
    id = db.Column(db.Integer, primary_key=True)
    codec = db.Column(db.String(20), unique=True)
    videos = db.relationship('VideoFile', backref='Video_Codec')

    def __repr__(self):
        return self.codec


class AudioCodec(db.Model):
    __tablename__ = 'audio_codec'
    id = db.Column(db.Integer, primary_key=True)
    codec = db.Column(db.String(20), unique=True)
    videos = db.relationship('VideoFile', backref='Audio_Codec')

    def __repr__(self):
        return self.codec


class MimeType(db.Model):
    __tablename__ = 'mime_type'
    id = db.Column(db.Integer, primary_key=True)
    mime = db.Column(db.String(20), unique=True)
    videos = db.relationship('VideoFile', backref='Mime_Type')

    def __repr__(self):
        return self.mime


class VideoFile(db.Model):
    __tablename__ = 'video_file'
    id = db.Column(db.Integer, primary_key=True)
    parent_video_id = db.Column(db.Integer, db.ForeignKey('video.id'))
    extention = db.Column(db.String(4), default="webm")
    video_codec_id = db.Column(db.Integer, db.ForeignKey(VideoCodec.id))
    audio_codec_id = db.Column(db.Integer, db.ForeignKey(AudioCodec.id))
    mime_type_id = db.Column(db.Integer, db.ForeignKey(MimeType.id))
    resolution = db.Column(db.String(16))
    is_fullscreen = db.Column(db.Boolean)
    has_fullscreen = db.Column(db.Boolean)

    def __repr__(self):
        return '<Video File %r>' % self.id

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]

    def get_audio_codec_if_present(self):
        if (self.Audio_Codec != None):
            return ',' + self.Audio_Codec.codec
        else:
            return ''

class Track(db.Model):
    __tablename__ = 'track'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Enum('subtitle', 'caption', 'description', 'chapters', 'metadata', name='track_type'))
    src_lang = db.Column(db.String(16), default="en-AU")
    parent_video_id = db.Column(db.Integer, db.ForeignKey('video.id'))

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
    files = db.relationship('VideoFile', backref='File_Parent')
    tracks = db.relationship('Track', backref='Track_Parent')
    running_time = db.Column(db.String(64))
    has_poster = db.Column(db.Boolean)
    date_published = db.Column(db.Date)
    licence_id = db.Column(db.Integer, db.ForeignKey('licence.id'))
    resolution = db.Column(db.String(16))

    def __repr__(self):
        return self.title

    def get_poster_url(self):
        return self.file_name + '.poster.svg'

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]