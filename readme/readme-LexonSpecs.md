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

#### 1. Obtener Empresas usuario

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetCompanies() | GetCompanies() |  
| results | <-- | <-- |  
|  | SyncCompaniesLef() |<-- |  



#### 2. Select Company
Lexon.Api

#### 3. Deselect Company
:arrow_right: Lexon.Api
asociado a la anterior operación o incluida en ella

### Files


#### 1. Get Files user

| Web.Client | Lexon.Api| Lexon.Lef |  
|:-----------:|:-----------:|:-----------:|  
| --> |  GetFiles() | GetFiles() |  
| results | <-- | <-- |  
|  | SyncFilesLef() |<-- |  


```c#
    # Obtenemos resultados filtrados 
    public string GetFiles(int idFile, string search, int index, int count )

    # Ampliamos y actualizamos datos de los datos de trabajo
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
    # Método común que asocia en base al tipo especificado (mail, client...)
    public int AssocciateMail(string type, string idMail, string idRelated)

    # lanzamiento de evento a la cola
    public string PublishThroughEventBusAsync(IntegrationEventLogEntry eventAssoc)


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

    #suscripción a cola
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

#### 1. Get Clients user

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

#### 1. Get Courts user

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

#### 1. Get Documents user

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

#### 1. Get Lawyers user

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
#### 1. Get Solicitors user

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
#### 1. Get Notarys user

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

#### 1. Get Notarys user
- Lexon.Api -> GetFolders(level:short, name:string) 
- Lexon.Lef -> SyncFoldersLef()

### Localice Mails

#### 1. Get Relations
- Web.Client -> SelectMail
- Lexon.Api -> GetRelationsMail(idMail:string)

###  Connect

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
[{
    "idUser": "114",
    "version": 5,
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
    "Name": "Chomin Chon",
    "Companies": [{
            "idCompany": 14,
            "name": "Lacasitos SA",
            "selected": true,
            "Folders": [{
                    "idFolder": 12345,
                    "name": "Chapulin colorado",
                    "path": "Documentos Guays/Chapulines/Chapulin colorado",
                    "docs":["123123123123","123123123123"]
                },
                {
                    "idFolder": 1234445,
                    "name": "Chapulin verde",
                    "path": "Documentos Guays/Chapulines/Chapulin verde",
                    "docs":["123123123123","123123123123"]
                }
            ],
            "Clients": [{
                    "idClient": 12345,
                    "name": "Cliente otra cosa",
                    "Tlf": "123454664",
                    "mails": []
                },
                {
                    "idClient": 1237,
                    "name": "Cliente comatoso",
                    "Tlf": "123445677",
                    "mails": []
                }
            ],
            "Courts": [{
                    "idCourt": 34,
                    "name": "Juzgado 12 Social Madrid",
                    "mails": []
                },
                {
                    "idCourt": 35,
                    "name": "Juzgado 27 Penal Madrid",
                    "mails": []
                }
            ],
            "Files": [{
                    "idFile": 347,
                    "name": "exp 347",
                    "Description": "expediente 347",
                    "mails": ["45456456456", "as1712712"]
                },
                {
                    "idFile": 348,
                    "name": "exp 348",
                    "Description": "expediente muy largo",
                    "mails": []
                },
                {
                    "idFile": 345,
                    "name": "expedientado",
                    "Description": "muy importante para mi",
                    "mails": []
                }
            ],
            "Lawyers": [{
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
            ],
            "Solicitors": [{
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
            ],
            "Notaries": [{
                "idNotary": 4,
                "name": "Notario de Soria",
                "mails": []
            }],
            "Logo": "url/laca.png"
        },
        {
            "idCompany": 15,
            "name": "Cerebritos SL",
            "selected": false,
            "Folders": [{
                    "idFolder": 23141,
                    "name": "avellanas",
                    "path": "Leche/Cacao/Avellanas",
                    "mails": ["as2341234sa121"]
                },
                {
                    "idFolder": 563434,
                    "name": "lima",
                    "path": "Hispanoamerica/Peru/Lima",
                    "mails": []
                }
            ],
            "Clients": [{
                    "idClient": 1234,
                    "name": "Cliente bien cobrado",
                    "Tlf": "123454664",
                    "mails": ["123454664", "223213344"]
                },
                {
                    "idClient": 1236,
                    "name": "Cliente climatológico",
                    "Tlf": "123445677",
                    "mails": []
                }
            ],
            "Courts": [{
                    "idCourt": 32,
                    "name": "Juzgado 13 Social Madrid",
                    "mails": ["121211111"]
                },
                {
                    "idCourt": 33,
                    "name": "Juzgado 17 Penal Madrid",
                    "mails": ["121211111", "as2341234sa121"]
                }
            ],
            "Documents": [{
                    "idDocument": 12345,
                    "name": "paco.docx",
                    "Description": "paco por escrito"
                },
                {
                    "idDocument": 12346,
                    "name": "paco.xls",
                    "Description": "paco cuadriculado"
                }
            ],
            "Files": [{
                    "idFile": 345,
                    "name": "exp 345",
                    "Description": "expediente expedientoso",
                    "mails": ["as2341234sa121"]
                },
                {
                    "idFile": 346,
                    "name": "exp 346",
                    "Description": "expediente expedientado",
                    "mails": ["121211111", "as2341234sa121", "11111134456"]
                },
                {
                    "idFile": 57,
                    "name": "federico",
                    "Description": "Creado en la consola, No tiene descripción",
                    "mails": ["121211111"]
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
            ],
            "Lawyers": [{
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
            ],
            "Solicitors": [{
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
            ],
            "Notaries": [{
                    "idNotary": 3,
                    "Name": "Notario de Huelva",
                    "mails": []
                },
                {
                    "idNotary": 14,
                    "Name": "No no Notorius",
                    "mails": []
                }
            ],
            "Logo": "url/topicCerebrito.png"
        }
    ]


}]
```

