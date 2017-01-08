from flask import Response, render_template, abort
import json
from theMetaCityMedia.models import db
from theMetaCityMedia.models import Video, Audio, Code, Picture, MediaItem, Tags
from . import api_1_0

from sqlalchemy.ext.declarative import DeclarativeMeta


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


@api_1_0.route('media_end_link')
def audio():
    data = {'a': 2, 'b': 3}
    resp = Response(
        response=json.dumps(data),
        status=200,
        mimetype="application/json")
    return resp


@api_1_0.route('video_end_follow_on')
def video_end_follow_on():
    media = Video.query.all()
    media.sort(key=lambda media_entry: media_entry.parent_id)
    media = media[::-1]
    return Response(
        response=json.dumps(media, cls=AlchemyEncoder),
        status=200,
        mimetype="application/json")
