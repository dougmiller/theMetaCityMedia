from flask import Blueprint

api_1_0 = Blueprint(
    'api_1_0',
    __name__,
    template_folder='templates',
    static_folder='static',
    subdomain='api',
    url_prefix="/v/1/0/"
)

from . import views
