﻿
namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class LexContact : Contact
    {
        public int? Id { get; set; }

        public int? IdType { get; set; } //TODO IdType

        public int? IdFolder { get; set; }

        public string EntityType { get; set; }

        //public string Dni { get; set; }
        //public string Fax { get; set; }
        //public string Web { get; set; }
        //public string Town { get; set; }
        //public string Address { get; set; }
        //public string Country { get; set; }
        //public int? IdPortal { get; set; }
        //public string Province { get; set; }
        //public int? IdProvince { get; set; }
        //public string PostalCode { get; set; }
        //"Day1": null, "Day2": null, "Day3": null, 
        // "Notes": "", 
        // "Charged": null, 
        //"IdEntry": null, 
        //"BirthDay": null, 
        //"BroughtBy": null,
        //"IdCountry": null, 
        //"Reference": "", 
        //"IBANNumber": null, 
        // "NamePortal": null, 
        // "UserPortal": null, 
        // "PaymentType": null, 
        //"PortalEmail": "m.palermo@workguardian.com", 
        //"StatePortal": 0, 
        //"IdpaymentType ": null, 
        // "PortalSecretKey": null, 
        //"StatePortalTest": null, 
        //"ManualExpiration": null, 
        //"AccountingAccount": null, 
        // "ExpirationsNumber": null, 
        //"DaysFirtsExpiration": null, 
        //"DaysBetweenExpiration": null
    }
}