from theMetaCityMedia import db


def format_size_to_human_readable(size):
    """
    Returns a string reporting the size of a file in human readable format
    """
    if size < 1024:
        return size + 'b'
    if size < 1048576:
        return str(int(round(size/1024))) + 'KB'
    if size < 1073741824:
        return str(int(round(size/1048576))) + 'MB'
    if size < 1099511627776:
        return str(int(round(size/1073741824))) + 'GB'
    return "Huge fucking file"


class Licence(db.Model):
    """
    Lists all the licences that can be used in the project
    Covers all the different media types (audio/video and code etc)
    """
    __tablename__ = 'licence'
    id = db.Column(db.Integer, primary_key=True)
    licence_name = db.Column(db.String, unique=True)
    licence_text = db.Column(db.String, unique=True)
    licence_url = db.Column(db.String, unique=True)
    image_url = db.Column(db.String, unique=True)
    items = db.relationship('MediaItem', backref='Licence', lazy='dynamic')

    def __repr__(self):
        return self.licence_name


class Postcards(db.Model):
    """
    A collection of the postcards used on the front page of media.
    Broken out so that title and alt text can be used as well as
    reduced redundancy when a different project uses the same postcard
    """
    __tablename__ = 'postcard'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String, unique=True)
    title = db.Column(db.String, unique=True)
    alt_text = db.Column(db.String, unique=True)
    items = db.relationship('MediaItem', backref='Postcard', lazy='dynamic')

    def __repr__(self):
        return self.url + ': ' + self.title


class Video(db.Model):
    """
    This is a collection of files that make up the different
    encodings, resolutions, formats and metadata of a single video
    The class 'VideoFile' is a single file in that set
    The class 'Track' is a track associated with the video (sub, captions etc)
    """
    __tablename__ = 'video'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('mediaitem.id'))
    file_name = db.Column(db.String(64), unique=True)
    files = db.relationship('VideoFile', backref='File_Parent')
    tracks = db.relationship('VideoTrack', backref='Track_Parent')
    running_time = db.Column(db.Float)
    has_start_poster = db.Column(db.Boolean)
    has_end_poster = db.Column(db.Boolean)
    has_fullscreen = db.Column(db.Boolean)
    date_published = db.Column(db.Date)
    resolution = db.Column(db.String(16))

    def __repr__(self):
        return self.title

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]

    def format_time_to_human_readable(self):
        return "{0}m {1}s".format(str(int((int(self.running_time) / 60))), str(int(self.running_time) % 60))

    def format_time_to_progress_format(self):
        return "{0}:{1}".format(str(int((int(self.running_time) / 60))), str(int(self.running_time) % 60))

    def get_largest_filesize(self):
        return max(video_file.file_size for video_file in self.files)

    def get_smallest_filesize(self):
        return min(video_file.file_size for video_file in self.files)

    def get_smallest_filesize_formatted(self):
        return format_size_to_human_readable(min(video_file.file_size for video_file in self.files))

    def get_largest_filesize_formatted(self):
        return format_size_to_human_readable(max(video_file.file_size for video_file in self.files))

    def difference_between_max_and_min_filesize(self):
        return self.get_largest_filesize() - self.get_smallest_filesize()

    def format_filesizes(self):
        if self.difference_between_max_and_min_filesize():
            return self.get_smallest_filesize_formatted() + " - " + self.get_largest_filesize_formatted()
        else:
            return self.get_largest_filesize_formatted()

    def get_mime_types(self):
        temp = list(set(video_file.mime_type for video_file in self.files))
        return temp


class VideoFile(db.Model):
    """
    This is a single file which has a unique set of:
    resolution
    file size
    encoding (audio and video)
    extension
    etc

    This file will be part of the set of the class 'Video'
    """
    __tablename__ = 'video_file'
    id = db.Column(db.Integer, primary_key=True)
    parent_video = db.Column(db.Integer, db.ForeignKey('video.id'))
    video_codec = db.Column(db.Enum('vp8', 'h264', 'theora', name='video_video_codec'))
    audio_codec = db.Column(db.Enum('nill', 'vorbis', 'mp3', 'wav', name='video_audio_codec'))
    mime_type = db.Column(db.Enum('webm', 'mp4', 'ogg', name='video_mime_type'))
    extension = db.Column(db.Enum('webm', 'ogv', 'mp4', name='video_file_extension'))
    resolution = db.Column(db.String(16))
    file_size = db.Column(db.Integer())
    is_fullscreen = db.Column(db.Boolean)

    def __repr__(self):
        return '<Video File %r>' % self.id

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]

    def get_audio_codec_if_present(self):
        if self.audio_codec != 'nill':
            return ',' + self.audio_codec
        else:
            return ''

    def human_readable_size(self):
        return format_size_to_human_readable(self.file_size)


class VideoTrack(db.Model):
    """
    Represents a single video media 'track'
    """
    __tablename__ = 'video_track'
    id = db.Column(db.Integer, primary_key=True)
    parent_video = db.Column(db.Integer, db.ForeignKey('video.id'))
    type = db.Column(db.Enum('subtitles', 'captions', 'descriptions', 'chapters', 'metadata', name='video_track_type'))
    src_lang = db.Column(db.String(16), default="en-AU")
    label = db.Column(db.String(16), default="English")

    def __repr__(self):
        return '<Video track: %r>' % self.id

    def get_url(self):
        return '.' + self.src_lang + '.' + self.type + '.vtt'

    def get_description(self):
        return self.type.title() + ': (' + self.label + ') ' + self.src_lang


class Audio(db.Model):
    """
    This is a collection of files that make up the different
    encodings formats and metadata of a single audio
    The class 'AudioFile' is a single file in that set
    The class 'Track' is a track associated with the video (sub, captions etc)
    """
    __tablename__ = 'audio'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('mediaitem.id'))
    file_name = db.Column(db.String, unique=True)
    files = db.relationship('AudioFile', backref='File_Parent')
    tracks = db.relationship('AudioTrack', backref='Audio_Parent')
    running_time = db.Column(db.Float)
    has_start_poster = db.Column(db.Boolean)
    has_end_poster = db.Column(db.Boolean)
    date_published = db.Column(db.Date)

    def __repr__(self):
        return self.title

    def get_start_poster_url(self):
        return self.file_name + '.startposter.svg'

    def get_end_poster_url(self):
        return self.file_name + '.endposter.svg'

    def format_time_to_human_readable(self):
        return "{0}m {1}s".format(str(int((int(self.running_time) / 60))), str(int(self.running_time) % 60))

    def get_largest_filesize(self):
        return format_size_to_human_readable(max(audio_file.file_size for audio_file in self.files))

    def get_smallest_filesize(self):
        return format_size_to_human_readable(min(audio_file.file_size for audio_file in self.files))

    def get_mime_types(self):
        types = []
        for f in self.files:
            if f.Mime_Type not in types:
                types.append(f.Mime_Type)
        return types


class AudioFile(db.Model):
    """
    This is a single audio file which has a unique set of:
    file size
    encoding (audio)
    extension
    etc

    This file will be part of the set of the class 'Audio'
    """
    __tablename__ = 'audio_file'
    id = db.Column(db.Integer, primary_key=True)
    parent_audio = db.Column(db.Integer, db.ForeignKey('audio.id'))
    audio_codec = db.Column(db.Enum('vorbis', 'mp3', 'wav', name='audio_audio_codec'))
    mime_type = db.Column(db.Enum('ogg', 'webm', 'mp3', 'wav', name='audio_mime_type'))
    extension = db.Column(db.Enum('ogg', 'mp3', 'wav', name='audio_file_extension'))
    bit_rate = db.Column(db.Integer())
    bit_depth = db.Column(db.Integer())
    sample_rate = db.Column(db.Integer())
    vbr_encoded = db.Column(db.Boolean)
    file_size = db.Column(db.Integer())

    def __repr__(self):
        return '<Audio File %r>' % self.id


class AudioTrack(db.Model):
    """
    Represents a single audio media 'track'
    """
    __tablename__ = 'audio_track'
    id = db.Column(db.Integer, primary_key=True)
    parent_audio = db.Column(db.Integer, db.ForeignKey('audio.id'))
    type = db.Column(db.Enum('subtitles', 'captions', 'descriptions', 'chapters', 'metadata', name='audio_track_type'))
    src_lang = db.Column(db.String, default="en-AU")
    label = db.Column(db.String, default="English")

    def __repr__(self):
        return '<Audio track: %r>' % self.id

    def get_url(self, audio):
        return audio.file_name + '.' + self.src_lang + '.' + self.type + '.vtt'

    def get_description(self):
        return self.type.title() + ': ' + self.src_lang


class Picture(db.Model):
    """
    This is the details of a picture including:
    path, resolution, thumbnail resolution etc
    """
    __tablename__ = 'picture'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('mediaitem.id'))
    file_name = db.Column(db.String, unique=True)
    date_published = db.Column(db.Date)
    resolution = db.Column(db.String)
    file_size = db.Column(db.Integer())

    def __repr__(self):
        return self.title

    def get_width(self):
        return self.resolution.split('x')[0]

    def get_height(self):
        return self.resolution.split('x')[1]

    def get_size(self):
        return format_size_to_human_readable(self.file_size)


class Code(db.Model):
    """
    This is the details of a picture including:
    path, resolution, thumbnail resolution etc
    """
    __tablename__ = 'code'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('mediaitem.id'))
    language = db.Column(db.String),
    file_name = db.Column(db.String, unique=True)
    date_published = db.Column(db.Date)
    file_size = db.Column(db.Integer())

    def __repr__(self):
        return self.title

    def get_size(self):
        return format_size_to_human_readable(self.file_size)


class Tags(db.Model):
    """
    Tags table
    """
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String, unique=True, nullable=False)

    def __repr__(self):
        return '%s' % self.tag


tags_joiner = db.Table('tags_joiner',
                       db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), nullable=False),
                       db.Column('mediaitem_id', db.Integer, db.ForeignKey('mediaitem.id'), nullable=False),
                       db.PrimaryKeyConstraint('tag_id', 'mediaitem_id')
                       )


class MediaItem(db.Model):
    """
    The model that media items (videos, pictures etc) are parented from
    """
    __tablename__ = "mediaitem"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, unique=True)
    about = db.Column(db.String)
    licence = db.Column(db.Integer, db.ForeignKey('licence.id'))
    postcard = db.Column(db.Integer, db.ForeignKey('postcard.id'))
    tags = db.relationship('Tags', secondary=tags_joiner, backref='mediaItems')

