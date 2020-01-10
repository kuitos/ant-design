## https://deploy-preview-20290--ant-design.netlify.com/

echo "Deploy to netlify..."
cd _site
zip -r site.zip *

sha=

site_url = "https://api.netlify.com/api/v1/sites/mysite.netlify.com/deploys"

# curl -H "Content-Type: application/zip" \
#      -H "Authorization: Bearer my-api-access-token" \
#      --data-binary "site.zip" \
#      https://api.netlify.com/api/v1/sites/mysite.netlify.com/deploys