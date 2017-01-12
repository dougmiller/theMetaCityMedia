from flask import Response
import json
from . import api_home


@api_home.route('')
def show_welcome_message():
    data = {
        'message': 'Hi. Welcome to the MetaCity API. For a list of currently supported API\'s, perform GET request to "/help"',
    }
    resp = Response(
        response=json.dumps(data),
        status=200,
        mimetype="application/json")
    return resp


@api_home.route('help')
def show_supported_versions():
    data = {
        'message': 'You have requested help',
        'supported_versions': [
            {
                'version': '1.0',
                'endpoint': '/v/1/0',
             }
        ]
    }
    resp = Response(
        response=json.dumps(data),
        status=200,
        mimetype="application/json")
    return resp
