@echo off
echo Checking CloudFormation stack status...
aws cloudformation describe-stacks --stack-name fake-food-detector-complete --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text
echo.
echo Getting API Gateway URL...
aws cloudformation describe-stacks --stack-name fake-food-detector-complete --region ap-southeast-1 --query "Stacks[0].Outputs[?OutputKey=='APIGatewayURL'].OutputValue" --output text
pause
