from flask import render_template
from videotmc import app
from models import Video


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route('/')
def show_index():
    vids = Video.query.all()
    return render_template('index.html', videos=vids)


@app.route('/<video>/')
def show_specific_video(video):
    vid = Video.query.filter_by(title=video).first_or_404()
    return render_template('video.html', video=vid)
