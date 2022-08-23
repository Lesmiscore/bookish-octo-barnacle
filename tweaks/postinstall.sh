#!/bin/bash
find . -name '*.node' -exec strip '{}' +

if [ ! -z "$AWS_EXECUTION_ENV" ] ; then
  rm node_modules/@sparticuz/chrome-aws-lambda/bin/chromium.br
fi

exit 0
