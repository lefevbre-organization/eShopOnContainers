﻿
namespace Lexon.API.Model
{
    public class JosUserCompanies
    {
        public string Name { get; set; }
        public long IdUser { get; set; }

        public JosCompany[] Companies { get; set; }

    }
}