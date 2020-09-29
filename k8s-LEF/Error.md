# Metotodos de gestion de errores

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

# Eventos de Bus

## Eventos de Bus en Accont.Api

* **AddUserMailIntegrationEvent**: Se produce cuando se crea un UserMail de manera satisfactoria
* **RemoveUserMailIntegrationEvent**: Se produce cuando se elimina un UserMail 
* **ChangueStateUserMailIntegrationEvent**: Se produce cuando cambia correctamente el estado de us UserMail 
* **RemoveAccountIntegrationEvent**: Se procuce cuando se elimina un Account de un UserMail
* **UpsertAccountIntegrationEvent**: Se produce al actualizar un Account, pudiendo crearse un UserMail en caso de que no exista
* **AddRawMessageIntegrationEvent**: Se prouce al añadir un raw a un Account