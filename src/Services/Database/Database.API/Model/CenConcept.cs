namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Models
{
    public class CenConcept
    {
        public long conceptId { get; set; }

        public long? conceptObjectId { get; set; }

        //"evaluated": false,
        public bool? evaluated { get; set; }

        public string title { get; set; }

        public string description { get; set; }

        public bool? published { get; set; }

        public bool? allowPublicShare { get; set; }
        public bool? publicShared { get; set; }

        public string publicUrl { get; set; }

        public bool? isFront { get; set; }

        //"processId": null,
        //public string processId { get; set; }

        //"processBaseId": null,
        //public string processBaseId { get; set; }

        public bool? hasProcessOps { get; set; }

        //"identifierFieldId": null,
        //public string identifierFieldId { get; set; }

        public bool? hidden { get; set; }
        public bool? singleInstance { get; set; }

        //"modified": "0001-01-01T00:00:00",
        public string modified { get; set; }

        //"totalInstances": null,
        //"totalInstancesSaved": null,
        //"iD_Version0": 29533,
        public int? iD_Version0 { get; set; }

        //"fields": [],
        //"documents": [],
        //"propertyVisibleValues": []
    }
}