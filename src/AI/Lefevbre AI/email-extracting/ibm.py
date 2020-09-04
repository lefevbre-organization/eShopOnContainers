import imaplib
import email
import getpass
import pandas as pd

from io import BytesIO

username =  "alberto.valverde.escribano@gmail.com"
password = "Alberto1971.-"
mail = imaplib.IMAP4_SSL('imap.gmail.com')#EMAIL SERVER
mail.login(username, password)



mail.select("inbox")
result, numbers = mail.uid('search', None, "ALL")
uids = numbers[0].split()
result, messages = mail.uid('fetch', ','.join(map(bytes.decode, uids)), '(BODY[])')




from_list = []
message_id = []
message_text = []
for _, message in messages[::2]:
  msg = email.message_from_string(str(message))
  if msg.is_multipart():
    t = []
    for p in msg.get_payload():
      t.append(p.get_payload(decode=True))
    #message_text.append(t[0])

  #else:
     #message_text.append(str(message))

  message_text.append(str(message))
  from_list.append(msg.get('from'))

  print (len(message_text))
  print (len(from_list))
  df = pd.DataFrame(data={'file':'435354','message':message_text})
  print (df.head())
  df.to_csv('inbox_email.csv',escapechar='\n' ,encoding='utf-8', index=True,)

