from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
mediaitem = Table('mediaitem', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('title', String),
    Column('about', String),
    Column('date_published', Date),
    Column('licence', Integer),
    Column('postcard', Integer),
)

picture = Table('picture', pre_meta,
    Column('id', INTEGER, primary_key=True, nullable=False),
    Column('parent_id', INTEGER),
    Column('file_name', VARCHAR),
    Column('date_published', DATE),
    Column('resolution', VARCHAR),
    Column('file_size', INTEGER),
)

code = Table('code', pre_meta,
    Column('id', INTEGER, primary_key=True, nullable=False),
    Column('parent_id', INTEGER),
    Column('file_name', VARCHAR),
    Column('date_published', DATE),
    Column('file_size', INTEGER),
)

video = Table('video', pre_meta,
    Column('id', INTEGER, primary_key=True, nullable=False),
    Column('parent_id', INTEGER),
    Column('file_name', VARCHAR(length=64)),
    Column('running_time', DOUBLE_PRECISION(precision=53)),
    Column('has_start_poster', BOOLEAN),
    Column('has_end_poster', BOOLEAN),
    Column('has_fullscreen', BOOLEAN),
    Column('date_published', DATE),
    Column('resolution', VARCHAR(length=16)),
)

audio = Table('audio', pre_meta,
    Column('id', INTEGER, primary_key=True, nullable=False),
    Column('parent_id', INTEGER),
    Column('file_name', VARCHAR),
    Column('running_time', DOUBLE_PRECISION(precision=53)),
    Column('has_start_poster', BOOLEAN),
    Column('has_end_poster', BOOLEAN),
    Column('date_published', DATE),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['mediaitem'].columns['date_published'].create()
    pre_meta.tables['picture'].columns['date_published'].drop()
    pre_meta.tables['code'].columns['date_published'].drop()
    pre_meta.tables['video'].columns['date_published'].drop()
    pre_meta.tables['audio'].columns['date_published'].drop()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['mediaitem'].columns['date_published'].drop()
    pre_meta.tables['picture'].columns['date_published'].create()
    pre_meta.tables['code'].columns['date_published'].create()
    pre_meta.tables['video'].columns['date_published'].create()
    pre_meta.tables['audio'].columns['date_published'].create()
