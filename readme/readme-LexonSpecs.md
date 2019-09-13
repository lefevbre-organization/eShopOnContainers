# Specs of Lexon

## Table of Contents

[[_TOC_]]

## Jira

#### 1. Mostrar localización de la documentación en las actuaciones de tipo email

- http://jira-led:8080/browse/WEB-23406

#### 2. Guardar los documentos del correo en el gestor documental
- http://jira-led:8080/browse/WEB-22107

#### 3. Guardar copia de los correos en Lex-ON
- http://jira-led:8080/browse/WEB-22108

#### 4. Creación automática de clasificaciones
- http://jira-led:8080/browse/WEB-23404

#### 5. Mostrar clasificaciones en las actuaciones de tipo email
- http://jira-led:8080/browse/WEB-23400

#### 6. Eliminar clasificaciones en las actuaciones de tipo email
- http://jira-led:8080/browse/WEB-23402

#### 7. Crear clasificaciones en las actuaciones de tipo email
- http://jira-led:8080/browse/WEB-22079

#### 8. Cambio de empresa desde el gestor de correo
- http://jira-led:8080/browse/WEB-23399

#### 9. Selector de empresa desde el gestor de correo
- http://jira-led:8080/browse/WEB-22084


## Operaciones:

### Companies

#### 1. Obtener Empresas usuario
- Lexon.Api -> GetCompanies 
- Lexon.Lef -> SyncCompaniesLef(id)

#### 2. Select Company
Lexon.Api

#### 3. Deselect Company
Lexon.Api
asociado a la anterior operación o incluida en ella

### Files

#### 1. Get Files user

    ---
    Lexon.Api: GetFiles 
    Lexon.Lef: SyncFilesLef(id)
    ---

#### 2. Associate File to Mail 
- Lexon.Api -> AssocciateMail(type:string, idMail:string, idRelated:string)
- Lexon.Api -> Push(AssociateMailToFile) -> Rabbit
- Lexon.Task -> Suscribe(AssociateMailToFile)
- Lexon.DB -> InsertAssociationMailToFile()
    - Lexon.Task -> Rabbit push message AssociateMailToFileConfirm
    - Lexon.Task -> Rabbit push message AssociateMailToFileError
- Lexon.Api -> Suscribe(AssociateMailToFileConfirm) + Suscribe(AssociateMailToFileError)
- Web.Client -> Suscribe(AssociateMailToFileConfirm) + Suscribe(AssociateMailToFileError)

#### 3. Disassociate File 
- Lexon.Api -> DisassociateMail(type:string, idMail:string, idRelated:string)
- Lexon.Api -> Push(DisassociateMailFromFile) -> Rabbit
- Lexon.Task -> Suscribe(DisassociateMailFromFile)
- Lexon.DB -> InsertAssociationMailFromFile()
    - Lexon.Task -> Rabbit push message DisassociateMailFromFileConfirm
    - Lexon.Task -> Rabbit push message DisassociateMailFromFileError
- Lexon.Api -> Suscribe(DisassociateMailFromFileConfirm) + Suscribe(DisassociateMailFromFileError)
- Web.Client -> Suscribe(DisassociateMailFromFileConfirm) + Suscribe(DisassociateMailFromFileError)

### Clients

#### 1. Get Clients user
- Lexon.Api -> GetClients 
- Lexon.Lef -> SyncClientsLef(id)

#### 2. Associate Client to Mail 
- Lexon.Api -> AssociateClient(type:string, idMail:string, idRelated:string)
- Lexon.Api -> Push(AssociateMailToClient) -> Rabbit
- Lexon.Task -> Suscribe(AssociateMailToClient)
- Lexon.DB -> InsertAssociationClientToFile()
    - Lexon.Task -> Rabbit push message AssociateMailToClientConfirm
    - Lexon.Task -> Rabbit push message AssociateMailToClientError
- Lexon.Api -> Suscribe(AssociateMailToClientConfirm) + Suscribe(AssociateMailToClientError)
- Web.Client -> Suscribe(AssociateMailToClientConfirm) + Suscribe(AssociateMailToClientError)

#### 3. Disassociate Client 
- Lexon.Api -> DisassociateMail(type:string, idMail:string, idRelated:string)
- Lexon.Api -> Push(DisassociateMailFromClient) -> Rabbit
- Lexon.Task -> Suscribe(DisassociateMailFromClient)
- Lexon.DB -> InsertAssociationMailFromClient()
    - Lexon.Task -> Rabbit push message DisassociateMailFromClientConfirm
    - Lexon.Task -> Rabbit push message DisassociateMailFromClientError
- Lexon.Api -> Suscribe(DisassociateMailFromClientConfirm) + Suscribe(DisassociateMailFromClientError)
- Web.Client -> Suscribe(DisassociateMailFromClientConfirm) + Suscribe(DisassociateMailFromClientError)

### Courts

#### 1. Get Courts user
- Lexon.Api -> GetCourts 
- Lexon.Lef -> SyncCourtsLef(id)

#### 2. Associate Court to Mail 
- Lexon.Api -> AssociateCourt(type:string, idMail:string, idRelated:string)
- Lexon.Api -> Push(AssociateMailToCourt) -> Rabbit
- Lexon.Task -> Suscribe(AssociateMailToCourt)
- Lexon.DB -> InsertAssociationCourtToFile()
    - Lexon.Task -> Rabbit push message AssociateMailToCourtConfirm
    - Lexon.Task -> Rabbit push message AssociateMailToCourtError
- Lexon.Api -> Suscribe(AssociateMailToCourtConfirm) + Suscribe(AssociateMailToCourtError)
- Web.Client -> Suscribe(AssociateMailToCourtConfirm) + Suscribe(AssociateMailToCourtError)

#### 3. Disassociate Court 
- Lexon.Api -> DisassociateMail(type:string, idMail:string, idRelated:string)
- Lexon.Api -> Push(DisassociateMailFromCourt) -> Rabbit
- Lexon.Task -> Suscribe(DisassociateMailFromCourt)
- Lexon.DB -> InsertAssociationMailFromCourt()
    - Lexon.Task -> Rabbit push message DisassociateMailFromCourtConfirm
    - Lexon.Task -> Rabbit push message DisassociateMailFromCourtError
- Lexon.Api -> Suscribe(DisassociateMailFromCourtConfirm) + Suscribe(DisassociateMailFromCourtError)
- Web.Court -> Suscribe(DisassociateMailFromCourtConfirm) + Suscribe(DisassociateMailFromCourtError)

### Documents
#### 1. Get Documents user
- Lexon.Api -> GetDocuments 
- Lexon.Lef -> SyncDocumentsLef(id)

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
- Lexon.Api -> GetLawyers 
- Lexon.Lef -> SyncLawyersLef(id)

#### 2. Associate Lawyer to Mail 
- Lexon.Api -> AssociateLawyer(type:string, idMail:string, idRelated:string, own:bool)
- Lexon.Api -> Push(AssociateMailToLawyer) -> Rabbit
- Lexon.Task -> Suscribe(AssociateMailToLawyer)
- Lexon.DB -> InsertAssociationMailToLawyer()
    - Lexon.Task -> Rabbit push message AssociateMailToLawyerConfirm
    - Lexon.Task -> Rabbit push message AssociateMailToLawyerError
- Lexon.Api -> Suscribe(AssociateMailToLawyerConfirm) + Suscribe(AssociateMailToLawyerError)
- Web.Client -> Suscribe(AssociateMailToLawyerConfirm) + Suscribe(AssociateMailToLawyerError)

#### 3. Disassociate Lawyer 
- Lexon.Api -> DisassociateMail(type:string, idMail:string, idRelated:string, own:bool)
- Lexon.Api -> Push(DisassociateMailFromLawyer) -> Rabbit
- Lexon.Task -> Suscribe(DisassociateMailFromLawyer)
- Lexon.DB -> InsertAssociationMailFromLawyer()
    - Lexon.Task -> Rabbit push message DisassociateMailFromLawyerConfirm
    - Lexon.Task -> Rabbit push message DisassociateMailFromLawyerError
- Lexon.Api -> Suscribe(DisassociateMailFromLawyerConfirm) + Suscribe(DisassociateMailFromLawyerError)
- Web.Client -> Suscribe(DisassociateMailFromLawyerConfirm) + Suscribe(DisassociateMailFromLawyerError)

### Solicitors
#### 1. Get Solicitors user
- Lexon.Api -> GetSolicitors 
- Lexon.Lef -> SyncSolicitorsLef(id)

#### 2. Associate Solicitor to Mail 
- Lexon.Api -> AssociateSolicitor(type:string, idMail:string, idRelated:string, own:bool)
- Lexon.Api -> Push(AssociateMailToSolicitor) -> Rabbit
- Lexon.Task -> Suscribe(AssociateMailToSolicitor)
- Lexon.DB -> InsertAssociationMailToSolicitor()
    - Lexon.Task -> Rabbit push message AssociateMailToSolicitorConfirm
    - Lexon.Task -> Rabbit push message AssociateMailToSolicitorError
- Lexon.Api -> Suscribe(AssociateMailToSolicitorConfirm) + Suscribe(AssociateMailToSolicitorError)
- Web.Client -> Suscribe(AssociateMailToSolicitorConfirm) + Suscribe(AssociateMailToSolicitorError)

#### 3. Disassociate Solicitor 
- Lexon.Api -> DisassociateMail(type:string, idMail:string, idRelated:string, own:bool)
- Lexon.Api -> Push(DisassociateMailFromSolicitor) -> Rabbit
- Lexon.Task -> Suscribe(DisassociateMailFromSolicitor)
- Lexon.DB -> InsertAssociationMailFromSolicitor()
    - Lexon.Task -> Rabbit push message DisassociateMailFromSolicitorConfirm
    - Lexon.Task -> Rabbit push message DisassociateMailFromSolicitorError
- Lexon.Api -> Suscribe(DisassociateMailFromSolicitorConfirm) + Suscribe(DisassociateMailFromSolicitorError)
- Web.Client -> Suscribe(DisassociateMailFromSolicitorConfirm) + Suscribe(DisassociateMailFromSolicitorError)

###  Notaries
#### 1. Get Notarys user
- Lexon.Api -> GetNotaries 
- Lexon.Lef -> SyncNotariesLef(id)

#### 2. Associate Notary to Mail 
- Lexon.Api -> AssociateNotary(type:string, idMail:string, idRelated:string, own:bool)
- Lexon.Api -> Push(AssociateMailToNotary) -> Rabbit
- Lexon.Task -> Suscribe(AssociateMailToNotary)
- Lexon.DB -> InsertAssociationMailToNotary()
    - Lexon.Task -> Rabbit push message AssociateMailToNotaryConfirm
    - Lexon.Task -> Rabbit push message AssociateMailToNotaryError
- Lexon.Api -> Suscribe(AssociateMailToNotaryConfirm) + Suscribe(AssociateMailToNotaryError)
- Web.Client -> Suscribe(AssociateMailToNotaryConfirm) + Suscribe(AssociateMailToNotaryError)

#### 3. Disassociate Notary 
- Lexon.Api -> DisassociateMail(type:string, idMail:string, idRelated:string, own:bool)
- Lexon.Api -> Push(DisassociateMailFromNotary) -> Rabbit
- Lexon.Task -> Suscribe(DisassociateMailFromNotary)
- Lexon.DB -> InsertAssociationMailFromNotary()
    - Lexon.Task -> Rabbit push message DisassociateMailFromNotaryConfirm
    - Lexon.Task -> Rabbit push message DisassociateMailFromNotaryError
- Lexon.Api -> Suscribe(DisassociateMailFromNotaryConfirm) + Suscribe(DisassociateMailFromNotaryError)
- Web.Client -> Suscribe(DisassociateMailFromNotaryConfirm) + Suscribe(DisassociateMailFromNotaryError)

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



