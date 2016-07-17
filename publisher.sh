#!/bin/bash

# Get config options
source publisher.config

if [[ $# -ne 0 ]]
then
    echo "Usage: ./publisher.sh"
    echo "There are no options."
    echo "This program 'replicates' from dev to prod (set in conf file) by a pg_dump of 'dev' then restores to 'prod' with a redirect to psql"
fi
echo "Dumping dev copy"
$dev_pg_dump -n public > /tmp/tmcmedia_dev_schema_and_objects
echo "Dropping prod schema"
$prod_psql -c "DROP SCHEMA public CASCADE;"
echo "Creating schema"
$prod_psql -c "CREATE SCHEMA public;"
echo "Pushing schema to prod"
$prod_psql -f /tmp/tmcmedia_dev_schema_and_objects
$prod_psql -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO tmcmediaselector;"
echo "Finished!"