namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models
{
    public class CenEvaluation
    {
        //"evaluationId": 4488,
        public int evaluationId { get; set; }

        //"name": "Anti-corruption",
        public string name { get; set; }

        //"productId": "anticorr",
        public string productId { get; set; }

        //"productName": "Anti-Corruption",
        public string productName { get; set; }

        //"clientId": 64,
        public int clientId { get; set; }

        //"clientName": "Casa, SL",
        public string clientName { get; set; }

        //"modified": "2020-03-04T10:41:53.2",
        public string modified { get; set; }

        //"progress": 100,
        public int? progress { get; set; }

        //"status": 2,
        public int? status { get; set; }

        public bool? risk { get; set; }
        public bool? normChange { get; set; }
        public bool? canManage { get; set; }
        public bool? canModify { get; set; }
    }
}