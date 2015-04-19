from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
audio_file = Table('audio_file', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('parent_audio', Integer),
    Column('audio_codec', Enum('vorbis', 'mp3', 'wav', name='audio_audio_codec')),
    Column('mime_type', Enum('ogg', 'webm', 'mp3', 'wav', name='audio_mime_type')),
    Column('extension', Enum('ogg', 'mp3', 'wav', name='audio_file_extension')),
    Column('bit_rate', Integer),
    Column('bit_depth', Integer),
    Column('sample_rate', Integer),
    Column('vbr_encoded', Boolean),
    Column('file_size', Integer),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['audio_file'].columns['bit_depth'].create()
    post_meta.tables['audio_file'].columns['bit_rate'].create()
    post_meta.tables['audio_file'].columns['sample_rate'].create()
    post_meta.tables['audio_file'].columns['vbr_encoded'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['audio_file'].columns['bit_depth'].drop()
    post_meta.tables['audio_file'].columns['bit_rate'].drop()
    post_meta.tables['audio_file'].columns['sample_rate'].drop()
    post_meta.tables['audio_file'].columns['vbr_encoded'].drop()
