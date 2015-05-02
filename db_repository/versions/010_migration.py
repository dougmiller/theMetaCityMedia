from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
video_tag = Table('video_tag', pre_meta,
    Column('id', INTEGER, primary_key=True, nullable=False),
    Column('parent_video', INTEGER),
    Column('tag', VARCHAR(length=30)),
)

audio_tag = Table('audio_tag', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('parent_video', Integer),
    Column('tag', String(length=30)),
)

code_tag = Table('code_tag', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('parent_video', Integer),
    Column('tag', String(length=30)),
)

picture_tag = Table('picture_tag', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('parent_video', Integer),
    Column('tag', String(length=30)),
)

video_tags = Table('video_tags', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('parent_video', Integer),
    Column('tag', String(length=30)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['video_tag'].drop()
    post_meta.tables['audio_tag'].create()
    post_meta.tables['code_tag'].create()
    post_meta.tables['picture_tag'].create()
    post_meta.tables['video_tags'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['video_tag'].create()
    post_meta.tables['audio_tag'].drop()
    post_meta.tables['code_tag'].drop()
    post_meta.tables['picture_tag'].drop()
    post_meta.tables['video_tags'].drop()
