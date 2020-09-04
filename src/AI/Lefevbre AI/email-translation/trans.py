from googletrans import Translator

T = Translator()

source="hola mundo"
try:
  dest = T.translate(source,src='es',dest='en').text
  print(dest)
except:
  print ('Error!!!')