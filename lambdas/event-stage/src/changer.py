import os

def handler(event, context):
  print(event)
  print(os.environ)
  return { 'statusCode': 204 }
