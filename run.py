#!flask/bin/python
from theMetaCityMedia import create_app
from os import path
from os import walk


app = create_app('config')
extra_dirs = ['theMetaCityMedia/api_0_1', 'theMetaCityMedia/media']
extra_files = extra_dirs[:]

for extra_dir in extra_dirs:
    for dirname, dirs, files in walk(extra_dir):
        for filename in files:
            filename = path.join(dirname, filename)
            if path.isfile(filename):
                extra_files.append(filename)

if __name__ == "__main__":
    app.run(extra_files=extra_files)
