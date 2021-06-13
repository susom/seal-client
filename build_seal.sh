#/bin/bash
npm run build

echo 'Removing the old files'
rm -Rf ~/IdeaProjects/sealonfhir/src/main/resources/static/seal-app/

echo 'copying new files'
cp -R dist/ ~/IdeaProjects/sealonfhir/src/main/resources/static/seal-app/
