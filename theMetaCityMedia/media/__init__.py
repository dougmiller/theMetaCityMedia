import os
from flask import Blueprint

media = Blueprint(
    'media',
    __name__,
    template_folder='templates',
    static_folder='static',
    subdomain='media'
)


@media.context_processor
def custom_importer():
    def import_svg(name):
        f = open(os.path.join(media.static_folder, 'images', name + '.svg'))
        data = f.readlines()[1:]
        f.close()
        return ''.join(data)
    return dict(import_svg=import_svg)

from . import views