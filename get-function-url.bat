@echo off
echo Getting Lambda Function URL...
aws lambda get-function-url-config --function-name fake-food-detector-restaurant-analyzer --region ap-southeast-1 --query "FunctionUrl" --output text
pause
