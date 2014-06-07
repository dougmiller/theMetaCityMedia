#!/bin/bash
set +e

if [[ $# -ne 1 ]]; then
  echo "Usage:"
  echo "target   # deploy to target destination"
  exit -1
fi

targets=("development", "production")

# Add mounts as needed
if ! [[ ${targets[*]} =~ $1 ]]; then
  echo "Unknown target. Please provide a known target."
  echo "Known target are: 'development', 'production'"  # Have to update these manually as bash does not have nested mounts
  exit 2
fi


# Proper command found, time to execute it
echo "I am going to deploy to target: $1"

if [ $1 == "development" ]; then
  echo "Starting deployment."
  echo "Starting to copy files"

  cd theMetaCityMedia
  sudo cp -R * /srv/http/tmcmedia/theMetaCityMedia

  echo "Finished copying files"
  echo "Finished deploying"
elif [ $1 == "production" ]; then
  echo "Checking if mount available"
  if mountpoint -q /media/tmcmedia ; then
      echo "Starting deployment"
      echo "Starting to copy files"
      cd theMetaCityMedia
      cp -R * /media/tmcmedia/theMetaCityMedia
      echo "Finished copying files"
      echo "Changing strings to production values"
      sed -i '/admin/d' /media/tmcmedia/theMetaCityMedia/__init__.py
      cd /media/tmcmedia/theMetaCityMedia/templates

      for i in *; do
        sed -i 's/http:\/\/assets.localcity.com/https:\/\/assets.themetacity.com/g' ${i}
      done

      echo "Finished deployment"
  else
    echo "tmcMedia is not mounted. Exiting."
    exit 3
  fi
fi
