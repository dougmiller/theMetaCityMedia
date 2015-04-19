from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
audio = Table('audio', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('title', String(length=64)),
    Column('about', String(length=512)),
    Column('file_name', String(length=64)),
    Column('running_time', Float),
    Column('has_start_poster', Boolean),
    Column('has_end_poster', Boolean),
    Column('date_published', Date),
    Column('licence', Integer, default=ColumnDefault(1)),
    Column('postcard', Integer, default=ColumnDefault(2)),
)

video = Table('video', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('title', String(length=64)),
    Column('about', String(length=512)),
    Column('file_name', String(length=64)),
    Column('running_time', Float),
    Column('has_start_poster', Boolean),
    Column('has_end_poster', Boolean),
    Column('date_published', Date),
    Column('resolution', String(length=16)),
    Column('licence', Integer, default=ColumnDefault(1)),
    Column('postcard', Integer, default=ColumnDefault(1)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['audio'].columns['running_time'].create()
    post_meta.tables['video'].columns['running_time'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['audio'].columns['running_time'].drop()
    post_meta.tables['video'].columns['running_time'].drop()
