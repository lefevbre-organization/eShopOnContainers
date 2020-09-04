#!/usr/bin/env python
import pika

credentials = pika.PlainCredentials('test', 'test')
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='lefebvre.westeurope.cloudapp.azure.com', credentials=credentials))
channel = connection.channel()

channel.queue_declare(queue='email-clustering')


def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    print(" [x] Received %r" % properties)
    print(" [x] Received %r" % ch)
    print(" [x] Received %r" % method)

channel.basic_consume(
    queue='email-clustering', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()