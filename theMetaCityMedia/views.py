from flask import render_template, abort
from theMetaCityMedia import app, db
from models import Video, Audio, Code, Picture, MediaItem, Tags


@app.errorhandler(404)
def page_not_found(self):
    return render_template('404.html'), 404

@app.errorhandler(500)
def page_not_found(self):
    return render_template('500.html'), 500


@app.route('/')
def show_index():
    media = []
    media += Video.query.all()
    media += Audio.query.all()
    media += Picture.query.all()
    media += Code.query.all()
    media.sort(key=lambda media_entry: media_entry.parent_id)
    media = media[::-1]
    return render_template('index.jinja2', media=media)

@app.route('/favicon.ico')
def show_favicon():
    return ''


@app.route('/video/')
def show_all_videos():
    media = Video.query.all()
    media.sort(key=lambda media_entry: media_entry.parent_id)
    media = media[::-1]
    return render_template('index.jinja2', media=media)

@app.route('/video/<video>/')
def show_specific_video(video):
    if video.isnumeric():
        video = Video.query.filter_by(id=video).first_or_404()
        return render_template('detailed/video.jinja2', video=video)
    else:
        abort(404)


@app.route('/code/')
def show_all_code():
    media = Code.query.all()
    media.sort(key=lambda media_entry: media_entry.parent_id)
    media = media[::-1]
    return render_template('index.jinja2', media=media)


@app.route('/code/<code_id>')
def show_specific_code(code_id):
    if code_id.isnumeric():
        code_snippet = Code.query.filter_by(id=code_id).first_or_404()
        return render_template('detailed/code.jinja2', code_snippet=code_snippet)
    else:
        abort(404)


@app.route('/audio/')
def show_all_audio():
    media = Audio.query.all()
    media.sort(key=lambda media_entry: media_entry.parent_id)
    media = media[::-1]
    return render_template('index.jinja2', media=media)


@app.route('/audio/<audio_id>')
def show_specific_audio(audio_id):
    if audio_id.isnumeric():
        audio = Audio.query.filter_by(id=audio_id).first_or_404()
        return render_template('detailed/audio.jinja2', audio=audio)
    else:
        abort(404)


@app.route('/picture/')
def show_all_pictures():
    media = Picture.query.all()
    media.sort(key=lambda media_entry: media_entry.parent_id)
    media = media[::-1]
    return render_template('index.jinja2', media=media)


@app.route('/picture/<picture_id>')
def show_specific_picture(picture_id):
    if picture_id.isnumeric():
        picture = Picture.query.filter_by(id=picture_id).first_or_404()
        return render_template('detailed/picture.jinja2', picture=picture)
    else:
        abort(404)


@app.route('/tag/<tag>')
def show_specific_tag(tag):
    media = []
    media += db.session.query(Video).join(MediaItem, Video.Parent).filter(MediaItem.tags.any(Tags.tag == tag))
    media += db.session.query(Audio).join(MediaItem, Audio.Parent).filter(MediaItem.tags.any(Tags.tag == tag))
    media += db.session.query(Picture).join(MediaItem, Picture.Parent).filter(MediaItem.tags.any(Tags.tag == tag))
    media += db.session.query(Code).join(MediaItem, Code.Parent).filter(MediaItem.tags.any(Tags.tag == tag))
    media.sort(key=lambda media_entry: media_entry.parent_id)
    media = media[::-1]
    return render_template('tags.jinja2', media=media)