#!/bin/bash
set +e

if [[ $# -ne 1 ]]; then
  echo "Usage: target"
  echo "Targets are 'develpment' and 'production'"
  exit -1
fi

targets=("development", "production")

# Add mounts as needed
if ! [[ ${targets[*]} =~ $1 ]]; then
  echo "Unknown target. Please provide a known target."
  echo "Known target are: 'development', 'production'"  # Have to update these manually as bash does not have nested arrays
  exit 2
fi

# Proper command found, time to execute it
echo "I am going to deploy to target: $1"

if [ $1 == "development" ]; then
  echo "Starting deployment to develpment environment"
  echo "Starting to copy files"

  cd theMetaCityMedia
  sudo rm -rf /srv/http/media.localcity.com/theMetaCityMedia/*
  sudo cp -R * /srv/http/media.localcity.com/theMetaCityMedia
  echo "Finished copying files"

  echo "Mogrifying paths"
  sudo find /srv/http/media.localcity.com/theMetaCityMedia/media/templates -type f -print0 | xargs -0 sed -i 's/http:\/\/assets.localcity.com:5000/http:\/\/assets.localcity.com/g'
  sudo find /srv/http/media.localcity.com/theMetaCityMedia/media/static -type f -print0 | xargs -0 sed -i 's/http:\/\/api.localcity.com:5000/http:\/\/api.localcity.com/g'
  echo "Fnished mogrifying paths"

  echo "Restarting server"
  sudo systemctl restart httpd
  echo "Finished deploying"
elif [ $1 == "production" ]; then
  echo "Starting deployment to production environment"

  echo "Checking if mount available"
  if ! mountpoint -q /media/media.themetacity.com ; then
    echo "media.themetacity.com is not mounted. Requesting mount..."
    tmcdeployer mount media
  fi

  echo "Starting to copy files from staging server"
  cd /srv/http/media.themetacity.com/theMetaCityMedia
  cp -R * /media/media.themetacity.com/theMetaCityMedia
  echo "Finished copying files"

  echo "Changing strings to production values"
  sed -i '/admin/d' /media/media.themetacity.com/theMetaCityMedia/__init__.py

  find /media/media.themetacity.com/theMetaCityMedia/templates -type f -print0 | xargs -0 sed -i 's/http:\/\/assets.localcity.com/https:\/\/assets.themetacity.com/g'
  find /media/media.themetacity.com/theMetaCityMedia/templates -type f -print0 | xargs -0 sed -i 's/http:\/\/api.localcity.com/https:\/\/api.themetacity.com/g'

  echo "Finished deployment"
fi
