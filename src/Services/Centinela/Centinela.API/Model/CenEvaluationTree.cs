﻿namespace Centinela.API.Models
{
    public class CenEvaluationTree
    {
        //{
        //"folderId": 82615,
        public int folderId { get; set; }

        //"parentId": null,
        public int? parentId { get; set; }

        //"name": "FASE 0. FASE INICIAL",
        public string name { get; set; }

        //"description": null,
        public string description { get; set; }

        //"published": true,
        public bool? published { get; set; }

        //"conceptObjectId": 0,
        public int? conceptObjectId { get; set; }

        //"evaluated": true,
        public bool? evaluated { get; set; }

        public CenConcept[] concepts { get; set; }
        public CenEvaluationTree[] children { get; set; }

        //"documents": null,
        //"propertyVisibleValues": [],
        //"totalConcepts": 3,
        public int? totalConcepts { get; set; }

        public bool? isFront { get; set; }

        public bool? hidden { get; set; }

        //"iD_Version0": 26786,
        public int? iD_Version0 { get; set; }

        //"level": 1
        public int? level { get; set; }
    }
}