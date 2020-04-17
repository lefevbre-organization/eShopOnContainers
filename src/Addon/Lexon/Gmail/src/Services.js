var apiEndpoint = "https://lexbox-test-apigwlex.lefebvre.es/api/v1/lex/Lexon/";
var nameEntityType = "";
var companyResponse = [];
var classificationsResponse = [];

function getCompanyList() {
    var url = this.apiEndpoint + "companies";
      var response = UrlFetchApp.fetch(url, {
        method: "get",
        // headers: headers,
        muteHttpExceptions: true
      });
      var raw = response.getContentText();
      return companyResponse = JSON.parse(raw);
}

function getClassifications(messageId, bbdd, idUser) {
    var url = this.apiEndpoint + "classifications";
    var data = {
        'idMail': messageId,
        'pageSize': 0,
        'pageIndex': 1,
        'bbdd': bbdd,
        'idUser': idUser
    };
    var options = {
        'method': "post",
        'contentType': 'application/json',
        'payload': JSON.stringify(data),
        'muteHttpExceptions': true
    };
      var response = UrlFetchApp.fetch(url, options);
      var raw = response.getContentText();
      return classificationsResponse = JSON.parse(raw);
}

function getNameEntityType(entityType) {
    switch (entityType) {
      case "files":
        nameEntityType = "Expediente"
        break;
      case "clients":
        nameEntityType = "Clientes"
      break;
      case "opposites": 
        nameEntityType = "Contrarios"
      break;
      case "suppliers": 
        nameEntityType = "Proveedores"
      break;
      case "lawyers": 
        nameEntityType = "Abogados propios"
      break;
      case "opposingLawyers": 
        nameEntityType = "Abogados contrarios"
      break;
      case "solicitors": 
        nameEntityType = "Procuradores propios"
      break;
      case "opposingSolicitors": 
        nameEntityType = "Procuradores contrarios"
      break;
      case "notaries": 
        nameEntityType = "Notarios"
      break;
      case "courts": 
        nameEntityType = "Juzgados"
      break;
      case "insurances": 
        nameEntityType = "Aseguradores"
      break;
      case "others": 
        nameEntityType = "Otros"
      break;
      case "folders": 
        nameEntityType = "Carpetas"
      break;
      case "documents": 
        nameEntityType = "Documentos"
      break;
      default:
        nameEntityType = ""
        break;
    }
  }