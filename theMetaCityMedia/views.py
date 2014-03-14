from flask import render_template
from theMetaCityMedia import app
from models import Video, VideoFile


@app.errorhandler(404)
def page_not_found():
    return render_template('404.html'), 404

@app.route('/')
def show_index():
    videos = Video.query.order_by(Video.date_published.desc())
    return render_template('index.html', videos=videos)

@app.route('/<video>/')
def show_specific_video(video):
    video = Video.query.filter_by(id=video).first_or_404()
    return render_template('video.html', video=video)
