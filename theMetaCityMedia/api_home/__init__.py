from flask import Blueprint

api_home = Blueprint(
    'api_home',
    __name__,
    template_folder='templates',
    static_folder='static',
    subdomain='api',
    url_prefix="/"
)

from . import views
