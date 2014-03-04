from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
video_file = Table('video_file', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('parent_video', Integer),
    Column('extention', String(length=4)),
    Column('codec', Integer),
    Column('resolution', String(length=16)),
    Column('is_fullscreen', Boolean, default=ColumnDefault(False)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['video_file'].columns['extention'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['video_file'].columns['extention'].drop()
