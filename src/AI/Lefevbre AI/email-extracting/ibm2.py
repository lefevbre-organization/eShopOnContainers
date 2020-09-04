import imaplib
import email
import pandas as pd

username =  "alberto.valverde.escribano@gmail.com"
password = "Alberto1971.-"
mail = imaplib.IMAP4_SSL('imap.gmail.com')#EMAIL SERVER
mail.login(username, password)

mail.select("inbox")

result, numbers = mail.uid('search', None, "ALL")

uids = numbers[0].split()
result, messages = mail.uid('fetch', ','.join(map(bytes.decode, uids)), '(BODY[])')



print(len(uids))
from_list = []
message_id = []
message_text = []
for row, message in messages[::2]:
  msg = email.message_from_string(str(message))
  message_id= msg.get("Message-ID")
  message_text.append(str(message))
  print (str(row))
  try:
   df = pd.DataFrame(data={'file': message_id, 'message': message_text})
   df.to_csv('inbox-dataframe.csv', escapechar='\n', encoding='utf-8', index=True, )
  except:
   print("An exception occurred")

