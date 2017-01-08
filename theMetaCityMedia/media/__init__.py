from flask import Blueprint

media = Blueprint(
    'media',
    __name__,
    template_folder='templates',
    static_folder='static',
    subdomain='media'
)

from . import views