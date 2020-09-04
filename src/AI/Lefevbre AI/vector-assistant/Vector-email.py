import imaplib, struct, time
import email
import email.header
import datetime
import os
import sys
import time
try:
    from PIL import Image
except ImportError:
    sys.exit("Cannot import from PIL: Do `pip3 install --user Pillow` to install")
import anki_vector
from anki_vector.util import degrees

class MailFunct():
    def __init__(self):
        self.user = 'alberto.valverde.escribano@gmail.com'
        self.password = 'Alberto1971.-'
        self.M = imaplib.IMAP4_SSL('imap.gmail.com', '993')
        self.M.login(self.user, self.password)


    def checkMail(self):
        self.M.select()
        #self.unRead = self.M.search(None, 'UnSeen')
        #return len(self.unRead[1][0].split())

        rv, data = self.M.search(None, "UnSeen")
        if rv != 'OK':
            print("No messages found!")
            return

        for num in data[0].split():
            rv, data = self.M.fetch(num, '(RFC822)')
            if rv != 'OK':
                print("ERROR getting message", num)
                return

            msg = email.message_from_bytes(data[0][1])
            hdr = email.header.make_header(email.header.decode_header(msg['Subject']))
            subject = str(hdr)

            message = "Hey Alberto, you have recieved a new email in Gmail, the subject of the message is:" + subject
            self.robotBasicAction(message)

            print(' [*] Waiting for rabbitmq messages. To exit press CTRL+C')


            print('As recibido un correo nuevo')
            print('el asunto es: ' + msg['Subject'])
            if msg.is_multipart():
                print('body:', msg.get_payload(0))
            else:
                print('body:', msg.get_payload(None, True))

            # Now convert to local date-time
            date_tuple = email.utils.parsedate_tz(msg['Date'])
            if date_tuple:
                local_date = datetime.datetime.fromtimestamp(
                    email.utils.mktime_tz(date_tuple))
                print("Local Date:", \
                      local_date.strftime("%a, %d %b %Y %H:%M:%S"))


    def sendData(self):
        self.numMessages = self.checkMail()
        # turn the string into packed binary data to send int
        #self.ser.write(struct.pack('B', self.numMessages))
        #print(self.numMessages)

    def callback(ch, method, properties, body):
        print(" [x] Received %r" % body)
        print(" [x] Received %r" % properties)
        print(" [x] Received %r" % ch)
        print(" [x] Received %r" % method)

    def robotBasicAction(self, message):

        args = anki_vector.util.parse_command_args()
        with anki_vector.Robot(args.serial) as robot:
            robot.behavior.drive_off_charger()
            robot.behavior.set_head_angle(degrees(45.0))
            robot.behavior.set_lift_height(0.0)
            current_directory = os.path.dirname(os.path.realpath(__file__))
            image_path = os.path.join("email.jpg")
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



emailfunct = MailFunct()

# check for new mail every minute
while 1:
    print
    'Sending'
    emailfunct.sendData()
    time.sleep(5)