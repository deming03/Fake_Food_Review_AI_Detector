#!/usr/bin/env python3
"""
创建DynamoDB表的脚本
使用AWS凭证环境变量来连接AWS
"""

import json
import boto3
import sys
import os
from botocore.exceptions import ClientError

def load_table_schemas():
    """加载表结构配置"""
    schema_file = os.path.join(os.path.dirname(__file__), '..', 'dynamodb', 'table-schemas.json')
    try:
        with open(schema_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"错误: 找不到配置文件 {schema_file}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"错误: JSON格式错误 {e}")
        sys.exit(1)

def create_table(dynamodb_client, table_config):
    """创建单个DynamoDB表"""
    table_name = table_config['TableName']
    
    try:
        # 检查表是否已存在
        try:
            dynamodb_client.describe_table(TableName=table_name)
            print(f"✓ 表 {table_name} 已存在")
            return True
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceNotFoundException':
                raise
        
        # 创建表
        print(f"📋 正在创建表: {table_name}")
        
        response = dynamodb_client.create_table(**table_config)
        
        # 等待表创建完成
        print(f"⏳ 等待表 {table_name} 创建完成...")
        waiter = dynamodb_client.get_waiter('table_exists')
        waiter.wait(TableName=table_name)
        
        print(f"✅ 表 {table_name} 创建成功")
        return True
        
    except ClientError as e:
        print(f"❌ 创建表 {table_name} 失败: {e.response['Error']['Message']}")
        return False
    except Exception as e:
        print(f"❌ 创建表 {table_name} 时发生未知错误: {str(e)}")
        return False

def main():
    """主函数"""
    print("🚀 开始创建DynamoDB表...")
    
    # 检查AWS凭证环境变量
    required_env_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN']
    missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
    
    if missing_vars:
        print(f"❌ 缺少AWS凭证环境变量: {', '.join(missing_vars)}")
        print("请先设置AWS环境变量:")
        print("$env:AWS_ACCESS_KEY_ID=\"your_access_key\"")
        print("$env:AWS_SECRET_ACCESS_KEY=\"your_secret_key\"")
        print("$env:AWS_SESSION_TOKEN=\"your_session_token\"")
        sys.exit(1)
    
    # 创建DynamoDB客户端
    try:
        region = os.environ.get('AWS_DEFAULT_REGION', 'ap-southeast-1')
        dynamodb_client = boto3.client('dynamodb', region_name=region)
        
        # 测试连接
        print(f"🔗 连接AWS DynamoDB (区域: {region})")
        dynamodb_client.list_tables()
        print("✅ AWS连接成功")
        
    except Exception as e:
        print(f"❌ AWS连接失败: {str(e)}")
        print("请检查AWS凭证和网络连接")
        sys.exit(1)
    
    # 加载表配置
    schemas = load_table_schemas()
    tables = schemas.get('tables', [])
    
    if not tables:
        print("❌ 没有找到表配置")
        sys.exit(1)
    
    # 创建所有表
    success_count = 0
    total_count = len(tables)
    
    for table_config in tables:
        if create_table(dynamodb_client, table_config):
            success_count += 1
    
    # 总结结果
    print(f"\n📊 创建结果: {success_count}/{total_count} 个表创建成功")
    
    if success_count == total_count:
        print("🎉 所有DynamoDB表创建完成！")
        
        # 显示创建的表
        print("\n📋 已创建的表:")
        for table_config in tables:
            table_name = table_config['TableName']
            print(f"  • {table_name}")
        
        sys.exit(0)
    else:
        print("⚠️  部分表创建失败，请检查错误信息")
        sys.exit(1)

if __name__ == "__main__":
    main()
