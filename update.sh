#!/bin/bash
echo "This script should not be run, it is not compatible with the current directives site."
exit 1

git config --global user.name "Eric Tendian"
git config --global user.email "erictendian@gmail.com"

cd directives
rm -Rf directives # inner folder
wget --recursive -A "*.html*" --no-parent http://directives.chicagopolice.org/directives/
mv directives.chicagopolice.org/directives directives
rmdir directives.chicagopolice.org
for file in directives/data/*.html\?*; do mv "$file" "${file%%\?*}"; done
git add -A
git commit -m "Directives as of `date +'%B %-e, %Y'`"
git push
cd ..

php diff.php
