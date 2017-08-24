#!/bin/bash

#
#	Select migrations to be used.
#
#

pushd migrations
rm *

#
#	Comment/uncomment desired migrations:
#
ln -s ../migrations-available/302_deploy_Other.js 302_deploy_Other.js


#
#	List selected migrations
#
ls -alF
popd
