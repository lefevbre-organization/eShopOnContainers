import imaplib, struct, time
import email
import email.header
import sys
import getpass
import datetime


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
            print('Message %s: %s' % (num, subject))
            print('Raw Date:', msg['Date'])
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


emailfunct = MailFunct()

# check for new mail every minute
while 1:
    print
    'Sending'
    emailfunct.sendData()
    time.sleep(5)