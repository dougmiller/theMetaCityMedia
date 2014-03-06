from configdetails import SQLUSER, SQLPASSWORD, SQLDB, SQLHOST, SECRET_KEY
import os

CSRF_ENABLED = True
SECRET_KEY = SECRET_KEY

basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://'+SQLUSER+':'+SQLPASSWORD+'@'+SQLHOST+'/'+SQLDB
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')