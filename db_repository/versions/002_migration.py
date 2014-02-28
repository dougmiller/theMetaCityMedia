from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
licences = Table('licences', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('license', String(length=64)),
    Column('license_text', String(length=64)),
    Column('licenseURL', String(length=64)),
)

video = Table('video', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('filename', String(length=64)),
    Column('title', String(length=64)),
    Column('license', Integer),
    Column('date_published', Date),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['licences'].create()
    post_meta.tables['video'].columns['date_published'].create()
    post_meta.tables['video'].columns['license'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['licences'].drop()
    post_meta.tables['video'].columns['date_published'].drop()
    post_meta.tables['video'].columns['license'].drop()
