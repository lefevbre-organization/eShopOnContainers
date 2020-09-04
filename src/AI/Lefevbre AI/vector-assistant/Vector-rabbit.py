#!/usr/bin/env python
import os
import sys
import time
import pika
try:
    from PIL import Image
except ImportError:
    sys.exit("Cannot import from PIL: Do `pip3 install --user Pillow` to install")
import anki_vector
from anki_vector.util import degrees


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
    message = "Hey Alberto, you have recieved a new email based on:" + str(body)
    robotBasicAction(message)
def robotBasicAction(message):

        args = anki_vector.util.parse_command_args()
        with anki_vector.Robot(args.serial) as robot:
            robot.behavior.drive_off_charger()
            robot.behavior.set_head_angle(degrees(45.0))
            robot.behavior.set_lift_height(0.0)
            current_directory = os.path.dirname(os.path.realpath(__file__))
            image_path = os.path.join("lefebvre.jpg")
            # Load an image
            image_file = Image.open(image_path)
            # Convert the image to the format used by the Screen
            print("Display image on Vector's face...")
            screen_data = anki_vector.screen.convert_image_to_screen_data(image_file)
            duration_s = 20.0
            robot.screen.set_screen_with_image_data(screen_data, duration_s)
            robot.audio.stream_wav_file("vector_bell_whistle.wav", 100)
            robot.behavior.say_text(message)
            time.sleep(3)
            robot.behavior.drive_on_charger()

channel.basic_consume(
    queue='email-clustering', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()