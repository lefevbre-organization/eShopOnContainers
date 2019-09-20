# Specs of Lexon

## Table of Contents

[[_TOC_]]

## Specs in Work items

### Jira of Documents

| Jira Link | Related also:|  
|:-----------|:-----------:| 
| [Mostrar localización de la documentación en las actuaciones de tipo email](http://jira-led:8080/browse/WEB-23406)  | [Documents](#Documents) |   
| [Guardar los documentos del correo en el gestor documental](http://jira-led:8080/browse/WEB-22107 ) | [Documents](#Documents) |  
| [Guardar copia de los correos en Lex-ON](http://jira-led:8080/browse/WEB-22108 ) | [Documents](#Documents) |  

### Jira of Classifications

| Jira Link | Related also:|  
|:-----------|:-----------:| 
| [Creación automática de clasificaciones]( http://jira-led:8080/browse/WEB-23404)  | [Lawyers](#Lawyers) |   
| [Mostrar clasificaciones en las actuaciones de tipo email](http://jira-led:8080/browse/WEB-23400 ) | [Solicitors](#Solicitors) |  
| [Eliminar clasificaciones en las actuaciones de tipo email]( http://jira-led:8080/browse/WEB-23402) | [Notaries](#Notaries) |  
| [Crear clasificaciones en las actuaciones de tipo email]( http://jira-led:8080/browse/WEB-22079) | [Files](#Files) |  

### Jira of Users and Companies

| Jira Link | Related also:|  
|:-----------|:-----------:| 
| [ Cambio de empresa desde el gestor de correo](http://jira-led:8080/browse/WEB-23399)  | [Companies](#Companies) |   
| [Selector de empresa desde el gestor de correo](http://jira-led:8080/browse/WEB-22084) | [Connect](#Connect) |  
  


## Operaciones:

### Companies

#### 1. Get User's Companies

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetCompanies() | GetCompanies() |  
| results | <-- | <-- |  
|  | SyncCompaniesLef() |<-- |  



#### 2. Select Company

| Web.Client | Lexon.Api| 
|:-----------:|:-----------:| 
| --> |  SelectCompany() |   
| results | <-- | 
 

#### 3. Deselect Company
:arrow_right: associated to the [previous operation](#GetUserCompanies) or included in it

### Files


#### 1. Get Files user

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetFiles() | GetFiles() |  
| results | <-- | <-- |  
|  | SyncFilesLef() |<-- |  


```c#
    # We get filtered results 
    public string GetFiles(int idFile, string search, int index, int count )

    # We expand and update work data
    public string SyncFilesLef(string results)
```

#### 2. Associate File to Mail 

##### Option Complete
| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | AssociateMail() | Push(AssociateMailToFile) |  |  |
|  |  | --> | Suscribe(AssociateMailToFile)  | InsertAssociationMailToFile() |
|  |  | Push(AssociateMailToFileConfirm) | results | <-- |
|  |  | Push(AssociateMailToFileError) | error | <-- |
| Suscribe(AssociateMailToFileConfirm) | Suscribe(AssociateMailToFileConfirm) |  |  |  |
| Suscribe(AssociateMailToFileError)  | Suscribe(AssociateMailToFileError) |  |  |  |


##### Option Limited

| Web.Client | Lexon.Api| Rabbit | Lexon.Lef 
|:-----:|:------:|:-----:|:-------:|
|  | AssociateMail() | Push(AssociateMailToFile) |  | 
|  | AssociateMail() |  | InsertAssociationMailToFile() | 
|  | results | <-- | <-- | 
| results | <-- |  |  | 


```c#
    # Common method that associates based on the specified type (mail, client...)
    public int AssocciateMail(string type, string idMail, string idRelated)

    # queue event launch example
    public string PublishThroughEventBusAsync(IntegrationEventLogEntry eventAssoc)

    # example of IntegrationEvent
    public class IntegrationEventLogEntry
    {
        #simplified
        public string Id { get; private set; }

        public Guid EventId { get; private set; }
        public string EventTypeName { get; private set; }

        public string EventTypeShortName => EventTypeName.Split('.')?.Last();

        public IntegrationEvent IntegrationEvent { get; private set; }

        public EventStateEnum State { get; set; }
        public int TimesSent { get; set; }
        public DateTime CreationTime { get; private set; }
        public string Content { get; private set; }
        public string TransactionId { get; private set; }

    }

    # queue subscription
    private void DoInternalSubscription(string eventName)
    {
        var containsKey = _subsManager.HasSubscriptionsForEvent(eventName);
        if (!containsKey)
        {
            if (!_persistentConnection.IsConnected)
            {
                _persistentConnection.TryConnect();
            }

            using (var channel = _persistentConnection.CreateModel())
            {
                channel.QueueBind(queue: _queueName,
                                    exchange: BROKER_NAME,
                                    routingKey: eventName);
            }
        }
    }
    
```

#### 3. Disassociate File 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | DisassociateMail() | Push(DisassociateMailFromFile) |  |  |
|  |  | --> | Suscribe(DisassociateMailFromFile)  | UpdateDeleteAssociation() |
|  |  | Push(DisassociateMailFromFileConfirm) | results | <-- |
|  |  | Push(DisassociateMailFromFileError) | error | <-- |
| Suscribe(DisassociateMailFromFileConfirm) | Suscribe(DisassociateMailFromFileConfirm) |  |  |  |
| Suscribe(DisassociateMailFromFileConfirm)  | Suscribe(DisassociateMailFromFileConfirm) |  |  |  |



### Clients

#### 1. Get User Clients

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetClients() | GetClients() |  
| results | <-- | <-- |  
|  | SyncClientsLef() |<-- |  


#### 2. Associate Client to Mail 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | AssociateClient() | Push(AssociateMailToClient) |  |  |
|  |  | --> | Suscribe(AssociateMailToClient)  | InsertAssociation() |
|  |  | Push(AssociateMailToClientConfirm) | results | <-- |
|  |  | Push(AssociateMailToFileError) | error | <-- |
| Suscribe(AssociateMailToClientConfirm) | Suscribe(AssociateMailToClientConfirm) |  |  |  |
| Suscribe(AssociateMailToClientError)  | Suscribe(AssociateMailToClientError) |  |  |  |



#### 3. Disassociate Client 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | DisassociateMail() | Push(DisassociateMailFromFile) |  |  |
|  |  | --> | Suscribe(DisassociateMailFromClient)  | UpdateDeleteAssociation() |
|  |  | Push(DisassociateMailFromClientConfirm) | results | <-- |
|  |  | Push(DisassociateMailFromClientError) | error | <-- |
| Suscribe(DisassociateMailFromClientConfirm) | Suscribe(DisassociateMailFromClientConfirm) |  |  |  |
| Suscribe(DisassociateMailFromClientError)  | Suscribe(DisassociateMailFromClientError) |  |  |  |


### Courts

#### 1. Get User Courts

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetCourts() | GetCourts() |  
| results | <-- | <-- |  
|  | SyncCourtsLef() |<-- |  


#### 2. Associate Court to Mail 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | AssociateCourt() | Push(AssociateMailToCourt) |  |  |
|  |  | --> | Suscribe(AssociateMailToCourt)  | InsertAssociation() |
|  |  | Push(AssociateMailToCourtConfirm) | results | <-- |
|  |  | Push(AssociateMailToCourtError) | error | <-- |
| Suscribe(AssociateMailToCourtConfirm) | Suscribe(AssociateMailToCourtConfirm) |  |  |  |
| Suscribe(AssociateMailToCourtError)  | Suscribe(AssociateMailToCourtError) |  |  |  |


#### 3. Disassociate Court 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | DisassociateMail() | Push(DisassociateMailFromCourt) |  |  |
|  |  | --> | Suscribe(DisassociateMailFromCourt)  | UpdateDeleteAssociation() |
|  |  | Push(DisassociateMailFromCourtConfirm) | results | <-- |
|  |  | Push(DisassociateMailFromCourtError) | error | <-- |
| Suscribe(DisassociateMailFromCourtConfirm) | Suscribe(DisassociateMailFromCourtConfirm) |  |  |  |
| Suscribe(DisassociateMailFromCourtError)  | Suscribe(DisassociateMailFromCourtError) |  |  |  |


### Documents

#### 1. Get User Documents

| Web.Client | Lexon.Api| Lexon.Lef | 
|:-----------:|:-----------:|:-----------:|  
| --> |  GetDocuments() | GetDocuments() |  
| results | <-- | <-- |  
|  | SyncDocumentsLef() |<-- |  


#### 2. Upload Document

- Web.Client -> Mail.Api
    - GetMsgFromMail()
    - GetAttachmentFromMail()
- Lexon.Api -> loop UploadDocument(idMail:string, documents:binary[])
- Lexon.Api -> Push(UploadDocument) -> Rabbit
- Lexon.Task -> loop Suscribe(UploadDocument)
- Lexon.DB -> loop InsertDocument()
    - Lexon.Task -> Rabbit push message InsertDocumentConfirm
    - Lexon.Task -> Rabbit push message InsertDocumentError
- Lexon.Api -> Suscribe(InsertDocumentConfirm) + Suscribe(InsertDocumentError)
- Web.Client -> Suscribe(InsertDocumentConfirm) + Suscribe(InsertDocumentError)

### Lawyers

#### 1. Get User Lawyers

| Web.Client | Lexon.Api| Lexon.Lef | 
|:-----------:|:-----------:|:-----------:|  
| --> |  GetLawyers() | GetLawyers() |  
| results | <-- | <-- |  
|  | SyncLawyersLef() |<-- |  



#### 2. Associate Lawyer to Mail 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | AssociateLawyer() | Push(AssociateMailToLawyer) |  |  |
|  |  | --> | Suscribe(AssociateMailToLawyer)  | InsertAssociation() |
|  |  | Push(AssociateMailToLawyerConfirm) | results | <-- |
|  |  | Push(AssociateMailToLawyerError) | error | <-- |
| Suscribe(AssociateMailToLawyerConfirm) | Suscribe(AssociateMailToLawyerConfirm) |  |  |  |
| Suscribe(AssociateMailToLawyerError)  | Suscribe(AssociateMailToLawyerError) |  |  |  |


#### 3. Disassociate Lawyer 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | DisassociateMail() | Push(DisassociateMailFromLawyer) |  |  |
|  |  | --> | Suscribe(DisassociateMailFromLawyer)  | UpdateDeleteAssociation() |
|  |  | Push(DisassociateMailFromLawyerConfirm) | results | <-- |
|  |  | Push(DisassociateMailFromLawyerError) | error | <-- |
| Suscribe(DisassociateMailFromLawyerConfirm) | Suscribe(DisassociateMailFromLawyerConfirm) |  |  |  |
| Suscribe(DisassociateMailFromLawyerError)  | Suscribe(DisassociateMailFromLawyerError) |  |  |  |


### Solicitors
#### 1. Get User Solicitors

| Web.Client | Lexon.Api| Lexon.Lef | 
|:-----------:|:-----------:|:-----------:|  
| --> |  GetSolicitors() | GetSolicitors() |  
| results | <-- | <-- |  
|  | SyncSolicitorsLef() |<-- |  


#### 2. Associate Solicitor to Mail 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | AssociateSolicitor() | Push(AssociateMailToSolicitor) |  |  |
|  |  | --> | Suscribe(AssociateMailToSolicitor)  | InsertAssociation() |
|  |  | Push(AssociateMailToSolicitorConfirm) | results | <-- |
|  |  | Push(AssociateMailToSolicitorError) | error | <-- |
| Suscribe(AssociateMailToSolicitorConfirm) | Suscribe(AssociateMailToSolicitorConfirm) |  |  |  |
| Suscribe(AssociateMailToSolicitorError)  | Suscribe(AssociateMailToSolicitorError) |  |  |  |


#### 3. Disassociate Solicitor 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | DisassociateMail() | Push(DisassociateMailFromSolicitor) |  |  |
|  |  | --> | Suscribe(DisassociateMailFromSolicitor)  | UpdateDeleteAssociation() |
|  |  | Push(DisassociateMailFromSolicitorConfirm) | results | <-- |
|  |  | Push(DisassociateMailFromSolicitorError) | error | <-- |
| Suscribe(DisassociateMailFromSolicitorConfirm) | Suscribe(DisassociateMailFromSolicitorConfirm) |  |  |  |
| Suscribe(DisassociateMailFromSolicitorError)  | Suscribe(DisassociateMailFromSolicitorError) |  |  |  |


###  Notaries
#### 1. Get User Notaries

| Web.Client | Lexon.Api| Lexon.Lef | 
|:-----------:|:-----------:|:-----------:|  
| --> |  GetNotaries() | GetNotaries() |  
| results | <-- | <-- |  
|  | SyncNotariesLef() |<-- |  


#### 2. Associate Notary to Mail 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | AssociateNotary() | Push(AssociateMailToNotary) |  |  |
|  |  | --> | Suscribe(AssociateMailToNotary)  | InsertAssociation() |
|  |  | Push(AssociateMailToNotaryConfirm) | results | <-- |
|  |  | Push(AssociateMailToNotaryError) | error | <-- |
| Suscribe(AssociateMailToNotaryConfirm) | Suscribe(AssociateMailToNotaryConfirm) |  |  |  |
| Suscribe(AssociateMailToNotaryError)  | Suscribe(AssociateMailToNotaryError) |  |  |  |

#### 3. Disassociate Notary 

| Web.Client | Lexon.Api| Rabbit | Lexon.Task | Lexon.Lef |
|:-----:|:------:|:-----:|:-------:|:------:|
|  | DisassociateMail() | Push(DisassociateMailFromNotary) |  |  |
|  |  | --> | Suscribe(DisassociateMailFromNotary)  | UpdateDeleteAssociation() |
|  |  | Push(DisassociateMailFromNotaryConfirm) | results | <-- |
|  |  | Push(DisassociateMailFromNotaryError) | error | <-- |
| Suscribe(DisassociateMailFromNotaryConfirm) | Suscribe(DisassociateMailFromNotaryConfirm) |  |  |  |
| Suscribe(DisassociateMailFromNotaryError)  | Suscribe(DisassociateMailFromNotaryError) |  |  |  |

### Masters

#### 1. Get User Folders

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetFolders() | GetFolders() |  
| results | <-- | <-- |  
|  | SyncFoldersLef() |<-- |


#### 2. Get Classifications List

Return the list of classifications to select by the user

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetClassification() | GetClassification() |  
| results | <-- | <-- |  
|  | SyncClassificationLef() |<-- |

Data model:

```json

      "entities": {
        "timestamp": "2019-09-12T21:26:17Z",
        "list": [
          {
            "id": 1,
            "name": "Expedientes"
          },
          {
            "id": 2,
            "name": "Clientes"
          },
          {
            "id": 3,
            "name": "Contrarios"
          },
          {
            "id": 4,
            "name": "Proveedores"
          },
          {
            "id": 5,
            "name": "Abogados propios"
          },
          {
            "id": 6,
            "name": "Abogados contrarios"
          },
          {
            "id": 7,
            "name": "Procuradores propios"
          },
          {
            "id": 8,
            "name": "Procuradores contrarios"
          },
          {
            "id": 9,
            "name": "Notarios"
          },
          {
            "id": 10,
            "name": "Juzgados"
          },
          {
            "id": 11,
            "name": "Aseguradoras"
          },
          {
            "id": 12,
            "name": "Otros"
          },
          {
            "id": 13,
            "name": "Carpetas"
          },
          {
            "id": 14,
            "name": "Documentos"
          }
        ]
      },
```


### Common Operations

#### 1. Get Relations

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetClassification() | GetClassification() |  
| results | <-- | <-- |  
|  | SyncClassificationLef() |<-- |
- Web.Client -> SelectMail
- Lexon.Api -> GetRelationsMail(idMail:string)

#### 2. Connect

1. Connect user
- Web.Client -> login lefebvre
- Lexon.Api -> ConnectUser

## Events and Bus

#### 1. Queus
- Lexon
- Lexon.Actions
- Lexon.Confirm
- Lexon.Clients
- Lexon.Errors

#### 2. Events
- Type Action -> Generate when api make changues in the data of Lexon 
- Type Refresh -> Generate to sync info from collections with LexonDB
- Type Confirm -> confirm the correct save os update of data in LexonDB
- Type Error -> inform that data don´t update in the LexonDB

#### 3. Flows
- ActionEvent -> LexonQueue + LexonActionsQueue
- ConfirmEvent -> LexonQueue  + LexonConfirmQueue + LexonClientQueue
- ErrorEvent -> LexonQueue  + LexonErrorQueue + LexonClientQueue

## Schema Lexon.Api Data reasilence

### schema complete

```json
[
  {
    "idUser": "114",
    "idNavision": "E123456",
    "Name": "Chomin Chon",
    "version": 7,
    "masters": {
      "entities": {
        "timestamp": "2019-09-12T21:26:17Z",
        "list": [
          {
            "id": 1,
            "name": "Expedientes"
          },
          {
            "id": 2,
            "name": "Clientes"
          },
          {
            "id": 3,
            "name": "Contrarios"
          },
          {
            "id": 4,
            "name": "Proveedores"
          },
          {
            "id": 5,
            "name": "Abogados propios"
          },
          {
            "id": 6,
            "name": "Abogados contrarios"
          },
          {
            "id": 7,
            "name": "Procuradores propios"
          },
          {
            "id": 8,
            "name": "Procuradores contrarios"
          },
          {
            "id": 9,
            "name": "Notarios"
          },
          {
            "id": 10,
            "name": "Juzgados"
          },
          {
            "id": 11,
            "name": "Aseguradoras"
          },
          {
            "id": 12,
            "name": "Otros"
          },
          {
            "id": 13,
            "name": "Carpetas"
          },
          {
            "id": 14,
            "name": "Documentos"
          }
        ]
      }
    },
    "Companies": {
      "timestamp": "2019-09-11T12:35:28Z",
      "list": [
        {
          "idCompany": 14,
          "Logo": "url/laca.png",
          "conn": "db_chomin_01",
          "name": "Lacasitos SA",
          "selected": true,
          "Folders": {
            "timestamp": "2019-09-11T12:35:28Z",
            "list": [
              {
                "level": 3,
                "idFolder": 12345,
                "idParent": 12121,
                "name": "Chapulin colorado",
                "path": "Documentos Guays/Chapulines/Chapulin colorado",
                "Documents": {}
              },
              {
                "level": 3,
                "idFolder": 12445,
                "idParent": 12121,
                "name": "Chapulin verde",
                "path": "Documentos Guays/Chapulines/Chapulin verde",
                "Documents": {
                  "timestamp": "2019-09-14T13:36:29Z",
                  "list": [
                    {
                      "idDocument": 12347,
                      "name": "cerebro.docx",
                      "description": "paco por escrito"
                    },
                    {
                      "idDocument": 123344,
                      "name": "estomago.ppt",
                      "description": "paco por powerpoint"
                    }
                  ]
                }
              },
              {
                "level": 1,
                "idFolder": 12312,
                "idParent": 12312,
                "path": "Documentos Guays/",
                "name": "Documentos Guays"
              },
              {
                "level": 2,
                "idFolder": 12313,
                "idParent": 12312,
                "path": "Documentos Guays/Chapulines/",
                "name": "Chapulines"
              },
              {
                "level": 3,
                "idFolder": 12314,
                "idParent": 12313,
                "name": "Chapulin Colorado"
              },
              {
                "level": 3,
                "idFolder": 12315,
                "idParent": 12313,
                "name": "Chapulin Verde"
              }
            ]
          },
          "Clients": {
            "timestamp": "2019-09-16T22:31:08Z",
            "list": [
              {
                "idClient": 12345,
                "own": true,
                "name": "Cliente otra cosa",
                "mails": []
              },
              {
                "idClient": 1237,
                "own": false,
                "name": "Cliente comatoso",
                "mails": []
              }
            ]
          },
          "Insurances": {
            "timestamp": "2019-09-14T10:11:51Z",
            "list": [
              {
                "idInsurance": 12,
                "name": "La Segurata SA",
                "mails": [ "sqweqwdasdasdeqwe1231", "adsfasfdsfsdcxvdeswfewewdx" ]
              },
              {
                "idClient": 11,
                "name": "Sure Sure Company",
                "mails": [ "dsfdsfghghjtfytysdeqwe1231", "adsfasfdsfsdc2131212qwqw12" ]
              }
            ]
          },
          "Suppliers": {
            "timestamp": "2019-09-14T10:11:51Z",
            "list": [
              {
                "idSupplier": 1,
                "name": "togas y tocados SA",
                "mails": [ "sqweqwdasdasdeqwe1231", "adsfasfdsfsdcxvdeswfewewdx" ]
              },
              {
                "idSupplier": 23,
                "name": "espiamos a cuenta SL",
                "mails": [ "dsfdsfghghjtfytysdeqwe1231", "adsfasfdsfsdc2131212qwqw12" ]
              }
            ]
          },
          "Courts": {
            "timestamp": "2019-09-16T22:31:08Z",
            "list": [
              {
                "idCourt": 34,
                "name": "Juzgado 12 Social Madrid",
                "mails": []
              },
              {
                "idCourt": 35,
                "name": "Juzgado 27 Penal Madrid",
                "mails": [ "sdewgdfhrtrth7788956" ]
              }
            ]
          },
          "Files": {
            "timestamp": "2019-09-16T22:31:08Z",
            "list": [
              {
                "idFile": 347,
                "code": "exp 347",
                "description": "expediente 347",
                "mails": [ "45456456456", "as1712712" ]
              },
              {
                "idFile": 348,
                "code": "exp 348",
                "description": "expediente muy largo",
                "mails": []
              },
              {
                "idFile": 345,
                "code": "expedientado",
                "description": "muy importante para mi",
                "mails": []
              }
            ]
          },
          "Lawyers": {
            "timestamp": "2019-09-16T22:31:08Z",
            "list": [
              {
                "idLawyer": 44,
                "own": true,
                "name": "Lima Mimon",
                "mails": []
              },
              {
                "idLawyer": 33,
                "own": false,
                "name": "Naranja Naranjón",
                "mails": []
              }
            ]
          },
          "Solicitors": {
            "timestamp": "2019-09-16T22:31:08Z",
            "list": [
              {
                "idSolicitor": 46,
                "own": true,
                "name": "Antonio Verdaguer",
                "mails": []
              },
              {
                "idSolicitor": 55,
                "own": false,
                "name": "Jaime De MariChalado",
                "mails": []
              }
            ]
          },
          "Notaries": {
            "timestamp": "2019-09-16T22:31:08Z",
            "list": [
              {
                "idNotary": 4,
                "name": "Notario de Soria",
                "mails": []
              }
            ]
          }
        },
        {
          "idCompany": 15,
          "Logo": "url/topicCerebrito.png",
          "name": "Cerebritos SL",
          "conn": "db_chomin_02",
          "selected": false,
          "Folders": {
            "timestamp": "2019-09-14T13:36:29Z",
            "list": [
              {
                "idFolder": 12111,
                "idParent": 12101,
                "level": 3,
                "name": "avellanas",
                "path": "Leche/Cacao/Avellanas",
                "Documents": {
                  "timestamp": "2019-09-14T13:36:29Z",
                  "list": [
                    {
                      "idDocument": 12345,
                      "name": "paco.docx",
                      "Description": "paco por escrito"
                    },
                    {
                      "idDocument": 12346,
                      "name": "paco.xls",
                      "Description": "paco cuadriculado"
                    }
                  ]
                }
              },
              {
                "idFolder": 16343,
                "idParent": 16240,
                "level": 3,
                "name": "lima",
                "path": "Hispanoamerica/Peru/Lima",
                "Documents": []
              },

              {
                "level": 2,
                "idFolder": 16240,
                "idParent": 16130,
                "path": "Hispanoamerica/Peru/",
                "name": "Peru"
              },
              {
                "level": 1,
                "idFolder": 16130,
                "idParent": 16130,
                "path": "Hispanoamerica/",
                "name": "Hispanoamerica"
              },
              {
                "level": 2,
                "idFolder": 12101,
                "idParent": 12100,
                "path": "Leche/Cacao/",
                "name": "Cacao"
              },
              {
                "level": 1,
                "idFolder": 12100,
                "idParent": 12100,
                "path": "Leche/",
                "name": "Leche"
              }
            ]
          },
          "Clients": {
            "timestamp": "2019-09-14T13:36:29Z",
            "list": [
              {
                "idClient": 1234,
                "own": true,
                "name": "Cliente bien cobrado",
                "mails": []
              },
              {
                "idClient": 1236,
                "own": true,
                "name": "Cliente climatológico",
                "mails": []
              }
            ]
          },
            "Insurances": {
              "timestamp": "2019-09-14T10:11:51Z",
              "list": [
                {
                  "idInsurance": 12,
                  "name": "La Segurata SA",
                  "mails": [ "sqweqwdasdasdeqwe1231", "adsfasfdsfsdcxvdeswfewewdx" ]
                },
                {
                  "idClient": 11,
                  "name": "Sure Sure Company",
                  "mails": [ "dsfdsfghghjtfytysdeqwe1231", "adsfasfdsfsdc2131212qwqw12" ]
                }
              ]
            },
            "Suppliers": {
              "timestamp": "2019-09-14T10:11:51Z",
              "list": [
                {
                  "idSupplier": 1,
                  "name": "togas y tocados SA",
                  "mails": [ "sqweqwdasdasdeqwe1231", "adsfasfdsfsdcxvdeswfewewdx" ]
                },
                {
                  "idSupplier": 23,
                  "name": "espiamos a cuenta SL",
                  "mails": [ "dsfdsfghghjtfytysdeqwe1231", "adsfasfdsfsdc2131212qwqw12" ]
                }
              ]
            },
            "Courts": {
              "timestamp": "2019-09-14T13:36:29Z",
              "list": [
                {
                  "idCourt": 32,
                  "name": "Juzgado 13 Social Madrid",
                  "mails": [ "121211111" ]
                },
                {
                  "idCourt": 33,
                  "name": "Juzgado 17 Penal Madrid",
                  "mails": [ "121211111", "as2341234sa121" ]
                }
              ]
            },
            "Files": {
              "timestamp": "2019-09-14T13:36:29Z",
              "list": [
                {
                  "idFile": 345,
                  "name": "exp 345",
                  "Description": "expediente expedientoso",
                  "mails": [ "as2341234sa121" ]
                },
                {
                  "idFile": 346,
                  "name": "exp 346",
                  "Description": "expediente expedientado",
                  "mails": [ "121211111", "as2341234sa121", "11111134456" ]
                },
                {
                  "idFile": 57,
                  "name": "federico",
                  "Description": "Creado en la consola, No tiene descripción",
                  "mails": [ "121211111" ]
                },
                {
                  "idFile": 3456,
                  "name": "desde la api",
                  "Description": "uff que bonito",
                  "mails": []
                },
                {
                  "idFile": 221,
                  "name": "apiapi",
                  "Description": "otro",
                  "mails": []
                },
                {
                  "idFile": 556,
                  "name": "desdeConsolaEsguay",
                  "Description": "Creado en la consola, No tiene descripción",
                  "mails": []
                },
                {
                  "idFile": 234,
                  "name": "fede champion",
                  "Description": "Creado en la consola, No tiene descripción",
                  "mails": []
                }
              ]
            },
            "Lawyers": {
              "timestamp": "2019-09-16T22:31:08Z",
              "list": [
                {
                  "idLawyer": 11,
                  "own": true,
                  "name": "Jorge Venturoso",
                  "mails": []
                },
                {
                  "idLawyer": 36,
                  "own": false,
                  "name": "Laura Mazo de Criminales",
                  "mails": []
                }
              ]
            },
            "Solicitors": {
              "timestamp": "2019-09-16T22:31:08Z",
              "list": [
                {
                  "idSolicitor": 46,
                  "own": true,
                  "name": "Antonio Verdaguer",
                  "mails": []
                },
                {
                  "idSolicitor": 55,
                  "own": false,
                  "name": "Jaime De MariChalado",
                  "mails": []
                }
              ]
            },
            "Notaries": {
              "timestamp": "2019-09-16T22:31:08Z",
              "list": [
                {
                  "idNotary": 3,
                  "Name": "Notario de Huelva",
                  "mails": []
                },
                {
                  "idNotary": 14,
                  "Name": "No no Notorius",
                  "mails": []
                }
              ]
            }
          }
      ]
    }
  }
]
```

### schema related with masters and documents


- timestamp is possibly used in other parts of structure, is useful to determine the time for the next synchro or automatized
- The path field allows you to position the folder within the folder structure
- The array of subdocuments named *Documents* is the list of docs in folders

```json

    "masters":{
        "timestamp":"2019-09-12T21:26:17Z",
        "folders":[
          {
            "level": 1,
            "idFolder": 12121,
            "idParent": 12121,
            "name": "avellanas",
            "Documents": [
              {
                "idDocument": 12347,
                "name": "cerebro.docx",
                "Description": "paco por escrito"
              },
              {
                "idDocument": 123344,
                "name": "estomago.ppt",
                "Description": "paco por powerpoint"
              }
            ]
          },
          {
            "level": 1,
            "idFolder": 12312,
            "idParent": 12312,
            "name": "Documentos Guays"
          },
            {"level":2,"idFolder":12313, "idParent": 12312,"name":"Chapulines"},
          {
            "level": 3,
            "idFolder": 12314,
            "idParent": 12313,
            "name": "Chapulin Colorado"
          },
          {
            "level": 3,
            "idFolder": 12315,
            "idParent": 12313,
            "name": "Chapulin Verde"
          }
            ]
    },
```

### schema of classifications

this is the response from petition of relations of a mail 

```json

[
  {
    "idMail": "dkljsajslfcdn123vndfdsffasades",
    "Classifications": [
      {
        "idClassification": 14,
        "name": "lo que sea será",
        "description": "si la tiene la tiene",
        "type": "EXP"
      },

      {
        "idClassification": 15,
        "name": "tiene otro nombre",
        "description": "",
        "type": "CLC"
      },
      {
        "idClassification": 16,
        "name": "pues va a ser que no",
        "description": "notario de cuenca",
        "type": "NOT"
      }
    ]
  },
  {
    "idMail": "13123dsfvdsfdsfq23w34",
    "Classifications": [
      {
        "idClassification": 34,
        "name": "nombre expediente",
        "description": "descrito muy bien",
        "type": "EXP"
      },

      {
        "idClassification": 35,
        "name": "nombre propio",
        "description": "",
        "type": "CLP"
      },
      {
        "idClassification": 36,
        "name": "nombre contrario",
        "description": "",
        "type": "CLC"
      }
    ]
  }
]


```