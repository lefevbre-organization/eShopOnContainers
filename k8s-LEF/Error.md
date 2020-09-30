# Metotodos de gestion de errores

# Areas de Error

Son los ámbitos diferenciados donde pueden producirse los errores, tenemos:
* MYSQLCONN: Se intenta llamar a MySql pero no se consigue realizar la conexión
* MYSQL : Se ha llamado al MySql y el procedimiento almacenado devuelve un error controlado en su colección de parámetros
* MONGO : Se ha llamado a Mongo, y Mongo ha devuelto un error controlado
* MONGOCONN :  Se intentaa llamar a Mongo pero no se puede realizar la conexión
* LEXONSVC : Servicio externo de Lexón 


# Tipos de Error

Se especifican tipos de error por Dominio, tenemos:
* AccountDomainException
* LexonDomainException

# Códigos de Error

## Errores en Account.Api

### Account.api - UserMail
* **AC01**: Error que se produce al crear un UserMail
* **AC02**: Error que se produce al hacer un Upsert en un UserMail
* **AC03**: Error que se produce al obtener un UserMail, se puede producir al no encontrar en elemento (error controlado) o por un error no controlado
* **AC04**: Error que se produce al cambiar el estado de un UserMail
* **AC05**: Error que se produce al actualizar la configuración de un UserMail
* **AC06**: Error que se produce al actualizar un UserMail

### Account.api - UserMail-Account
* **AC10**: Error que se produce al obtener un Account
* **AC11**: Error que se produce al obtener el Account por defecto, se puede producir al no encontrar un elementos (error controlado) o por un error no controlado.
* **AC12**: Error que se produce al eliminar un Account.
* **AC13**: Error que se produce al establecer un Account por defecto.
* **AC14**: Error que se produce al actualizar un Account.
* **AC15**: Error que se produce al actualizar la configuración de un Account.
  
### Account.api - UserMail-Relations
* **AC20**: Error que se produce al hacer upsert en una relación de un Account.
* **AC21**: Error que se produce al eliminar de una relación de un Account.
* **AC22**: Error que se produce al obtener relaciones de un Account.

### Account.api - UserMail-Raw
* **AC30**: Error que se produce al obtener el Raw de un UserMail, se puede producir al no encontrar un UserMail (error controlado) o por un error no controlado.
* **AC31**: Error que se produce al insertar el Raw en un UserMail.
* **AC32**: Error que se produce al eliminar el Raw en un UserMail.

### Account.api - EventTypes
* **AC40**: Error que se produce al obtener EventTypes de un AccountEventTypes.
* **AC41**: Error que se produce al actualizar EventTypes de un AccountEventTypes.
* **AC42**: Error que se produce al eliminar EventTypes de un AccountEventTypes, se puede producir al no encontrar el Account (error controlado) o pr un error no controlado
* **AC43**: Error que se produce al insertar EventTypes en un AccountEventTypes, se pueden producir multiples variantes dependiendo de que se produczca actualizaciones o inservciones de AccountEventTypes.
* **AC44**: Error que se produce al eliminar AccountEventTypes. 

## Errores en Lexon.Api

* **LX01**: Info que se registra con los entornos enviados desde os clientes, importante revisarlos a efectos de comporbar cambios en los mismos.

### UserUtils.api - User
* **LX02**: Error que se produce al obtener un LexUser, se puede producir en el área de MYSQL o en la de MONGO (habiendo fallado antes en MYSQL)
* **LX03**: Error que se produce al obtener Companies de un  LexUser, se puede producir en el área de MYSQL o en la de MONGO (habiendo fallado antes en MYSQL)
* **LX04**: Error que se produce al obtener un LexUserSimple, se puede producir en el área de MYSQL o en la de MONGO (habiendo fallado antes en MYSQL)

### UserUtils.api - Classifications
* **LX10**: Error que se produce al añadir un ClassificationAddView a un LexUser, se puede producir en el área de MYSQL o en la de MONGO (habiendo fallado antes en MYSQL)
* **LX11**: Error que se produce al añadir un ClassificationContactView a un LexUser
* **LX12**: Error que se produce al eliminar un ClassificationAddView a un LexUser, se puede producir en el área de MYSQL o en la de MONGO (habiendo fallado antes en MYSQL)
* **LX13**: Erro que se produce al recuperar LexMailActuation, es importante comporbar el mensaje de error, porque se han dado resultados que parecen correctos pero que traen cadenas vacias o mal formadas 
* **LX14**: Error que se produce al recuperar Entities, es importante comporbar el mensaje de error, porque se han dado resultados que parecen correctos pero que traen cadenas vacias o mal formadas 
* **LX15**: Error que se produce al recuperar Entities, es importante comporbar el mensaje de error, porque se han dado resultados que parecen correctos pero que traen cadenas vacias o mal formadas 
* **LX16**: Error que se produce al recuperar las entidades maestras 
* **LX17**: Error que se produce al chequear las relaciones de un email
  
### UserUtils.api - Classifications/Contacts
* **LX20**: Error que se produce al recuperar un contacto
* **LX21**: Error que se produce al recuperar todos los contactos
  
### UserUtils.api - Classifications/Folders
* **LX30**: Info que se produce al solicitar entidades de tipo documento (14) o carpeta (13)
* **LX31**: Error que se produce al recuperar archivos y carpetas anidadas, lo que puede provocar fallos de varios tipos , interesa hacer un seguimiento del rendimiento de estos métodos debido a la sobrecarga que realizan

### UserUtils.api - Classifications/Files
* **LX40**: Error que se produce al intentar recuperar un archivo en el servicio de LexOn
* **LX41**:  Error que se produce al intentar guardar un archivo en el servicio de LexOn
  
### UserUtils.api - Appointments
* **LX50**: Error que se produce al intentar recuperar un archivo en el servicio de LexOn
* **LX51**:  Error que se produce al intentar guardar un archivo en el servicio de LexOn

# Eventos de Bus

## Eventos de Bus en Accont.Api

* **AddUserMailIntegrationEvent**: Se produce cuando se crea un UserMail de manera satisfactoria
* **RemoveUserMailIntegrationEvent**: Se produce cuando se elimina un UserMail 
* **ChangueStateUserMailIntegrationEvent**: Se produce cuando cambia correctamente el estado de us UserMail 
* **RemoveAccountIntegrationEvent**: Se procuce cuando se elimina un Account de un UserMail
* **UpsertAccountIntegrationEvent**: Se produce al actualizar un Account, pudiendo crearse un UserMail en caso de que no exista
* **AddRawMessageIntegrationEvent**: Se prouce al añadir un raw a un Account