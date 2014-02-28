from videotmc import db

class Licences(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    license = db.Column(db.String(64), unique=True)
    license_text = db.Column(db.String(64), unique=True)
    licenseURL = db.Column(db.String(64), unique=True)
    db.relationship('Video', backref = 'videos', lazy = 'dynamic')

    def __repr__(self):
        return '<License %r>' % (self.license)

class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(64), index=True, unique=True)
    title = db.Column(db.String(64), index=True, unique=True)
    running_time = db.Column(db.String(64), index=True)
    about = db.Column(db.String(512), index=True)
    license = db.Column(db.Integer, db.ForeignKey('licences.id'))
    date_published = db.Column(db.Date)

    def __repr__(self):
        return '<Video %r>' % (self.title)