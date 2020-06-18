namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Models
{
    public class CenConceptInstance
    {
        public long conceptId { get; set; }

        public long? conceptObjectId { get; set; }
        public long? folderId { get; set; }

        //"evaluated": false,
        public bool? evaluated { get; set; }

        //"title": "DATOS DE LA EMPRESA",
        public string title { get; set; }

        public string description { get; set; }
        public string author { get; set; }

        public bool? isArchived { get; set; }

        //"creationDate": "2020-03-23T13:23:25.33",
        public string creationDate { get; set; }

        //"modificationDate": "2020-04-03T11:56:41.737"
        public string modificationDate { get; set; }
    }
}