from flask import Response
import json
from theMetaCityMedia.models import Video, Audio, Code, Picture, MediaItem, Tags
from . import api_1_0

from sqlalchemy.ext.declarative import DeclarativeMeta
from  sqlalchemy.sql.expression import func


class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
                data = obj.__getattribute__(field)
                try:
                    json.dumps(data) # this will fail on non-encodable values, like other classes
                    fields[field] = data
                except TypeError:
                    fields[field] = None
            # a json-encodable dict
            return fields

        return json.JSONEncoder.default(self, obj)


@api_1_0.route('')
def show_welcome_message():
    data = {
        'message': 'This is version 1.0.0 for the MetaCity API. For a list of currently supported actions and endpoints\'s, perform GET request to "/v/1/0/help"',
    }

    resp = Response(
        response=json.dumps(data),
        status=200,
        mimetype="application/json")
    return resp


@api_1_0.route('help')
def show_help_message():
    data = {
        'message': 'Thanks for subscribing to cat facts.',
    }

    resp = Response(
        response=json.dumps(data),
        status=200,
        mimetype="application/json")
    return resp


@api_1_0.route('video_end_follow_on/<current_video_id>')
@api_1_0.route('video_end_follow_on')
def video_end_follow_on(current_video_id=None):
    videos_query = Video.query.order_by(func.random()).limit(2).all()
    videos = []
    for video in videos_query:
        video_data = {
            'id': video.Parent.id,
            'title': video.Parent.title,
            'file_name': video.file_name,
            'running_time': video.running_time,
        }
        videos.append(video_data)
    return Response(
        response=json.dumps(videos, cls=AlchemyEncoder),
        status=200,
        mimetype="application/json")


@api_1_0.after_request
def apply_caching(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response
