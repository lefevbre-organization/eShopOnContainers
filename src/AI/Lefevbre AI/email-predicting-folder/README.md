# MachineLearningMail
Rangement automatique de mails

La premiere étape avant de lancer le programme est de dezipper l'archive 'data'. Attention le chemin que nous avons prévu dans le programme est : ./data il se peut qu'en dezippant, les données se trouvent dans le dossier ./data/data.

Pour lancer le programme il suffit de lancer la commande :
python3 mail2directory.py

Il est possible de modifier plusieurs paramètres de ce programme :

1) le dataset :
Le ou les datasets sur lesquels travailera le programme peuvent être modifiés directement dans la variable : datasets du fichier mail2directory.py.
A noter qu'il y a plusieurs datasets disponibles : all1, all2, all3, kaminski1, kaminski2 qui sont présentés dans le rapport. Ils sont présents dans le fichier data

2) le descripteur :
Pour modifier la partie descripteurs, il faut décommenter les descripteurs que l'ont veut lancer dans la partie "Descriptors"

3) le modele :
Pour modifier la partie modele, il faut décommenter le modele que vous souhaitez utiliser dans la partie "Train classification model" du fichier mail2directory.py. Les modeles et leurs paramètres sont définis dans le dossier mail2directory.py


Le second programme a pour objectif d'optimiser la partie descripteur de la chaine. Celui-ci peut être lancé avec la commande :
python3 searchBestDesc.py
Le ou les dataset sur lesquels travailera le programme peuvent être modifiés directement dans la variable : datasets du fichier searchBestDesc.py.