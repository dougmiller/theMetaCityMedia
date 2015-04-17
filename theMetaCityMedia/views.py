from flask import render_template, abort
from theMetaCityMedia import app
from models import Video, Audio, Code, Picture


@app.errorhandler(404)
def page_not_found():
    return render_template('404.html'), 404


@app.route('/')
def show_index():
    media = []
    media += Video.query.all()
    media += Audio.query.all()
    media += Picture.query.all()
    media += Code.query.all()
    media.sort(key=lambda media_entry: media_entry.date_published)
    return render_template('index.jinja2', media=media)


@app.route('/video/<video>/')
def show_specific_video(video):
    if video.isnumeric():
        video = Video.query.filter_by(id=video).first_or_404()
        return render_template('detailed/video.jinja2', video=video)
    else:
        abort(404)


@app.route('/code/<code_id>')
def show_specific_code(code_id):
    if code_id.isnumeric():
        code_snippet = Code.query.filter_by(id=code_id).first_or_404()
        return render_template('detailed/code.jinja2', code_snippet=code_snippet)
    else:
        abort(404)


@app.route('/audio/<audio_id>')
def show_specific_audio(audio_id):
    if audio_id.isnumeric():
        audio_clip = Audio.query.filter_by(id=audio_id).first_or_404()
        return render_template('detailed/audio.jinja2', audio_clip=audio_clip)
    else:
        abort(404)


@app.route('/picture/<picture_id>')
def show_specific_picture(picture_id):
    if picture_id.isnumeric():
        picture = Picture.query.filter_by(id=picture_id).first_or_404()
        return render_template('detailed/picture.jinja2', picture=picture)
    else:
        abort(404)