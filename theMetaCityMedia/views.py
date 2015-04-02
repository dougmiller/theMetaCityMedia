from flask import render_template, abort
from theMetaCityMedia import app
from models import Video


@app.errorhandler(404)
def page_not_found():
    return render_template('404.html'), 404

@app.route('/')
def show_index():
    videos = Video.query.order_by(Video.date_published.desc())
    return render_template('index.jinja2', videos=videos)

@app.route('/<video>/')
def show_specific_video(video):
    if video.isnumeric():
        video = Video.query.filter_by(id=video).first_or_404()
        return render_template('detailed.jinja2', video=video)
    else:
        abort(404)

@app.route('/code/<code_id>')
def show_specific_video(code_id):
    if code_id.isnumeric():
        code_snippet = Video.query.filter_by(id=code_id).first_or_404()
        return render_template('detailed/code.jinja2', code_snippet=code_snippet)
    else:
        abort(404)

@app.route('/audio/<audio_id>')
def show_specific_video(audio_id):
    if audio_id.isnumeric():
        audio_clip = Video.query.filter_by(id=audio_id).first_or_404()
        return render_template('detailed/audio.jinja2', audio_clip=audio_clip)
    else:
        abort(404)

@app.route('/picture/<picture_id>')
def show_specific_video(picture_id):
    if picture_id.isnumeric():
        picture = Video.query.filter_by(id=picture_id).first_or_404()
        return render_template('detailed/picture.jinja2', picture=picture)
    else:
        abort(404)