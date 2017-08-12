#!/bin/bash

pushd test
rm *
ls

function enable {
	ln -s ../test-available/$1 $1
}

enable logformatter.js

enable $@

ls -alF
popd
