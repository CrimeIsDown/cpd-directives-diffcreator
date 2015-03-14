#!/bin/bash
cd ../cpd-directives
rm -Rf directives
wget --recursive -A "*.html*" --no-parent http://directives.chicagopolice.org/directives/
mv directives.chicagopolice.org/directives directives
rmdir directives.chicagopolice.org
git add -A
git commit -m "Directives as of `date +'%B %-e, %Y'`"
git push
