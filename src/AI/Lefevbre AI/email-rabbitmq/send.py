
import pika

credentials = pika.PlainCredentials('test', 'test')
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='lefebvre.westeurope.cloudapp.azure.com', credentials=credentials))
channel = connection.channel()

channel.queue_declare(queue='hello')

channel.basic_publish(exchange='', routing_key='hello', body='Hello World!')
print(" [x] Sent 'Hello World!'")
connection.close()

