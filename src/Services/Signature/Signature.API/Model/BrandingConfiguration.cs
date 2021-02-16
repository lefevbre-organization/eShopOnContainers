using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    [BsonIgnoreExtraElements]
    public class BrandingConfiguration
    {
        public BrandingAppTexts application_texts { get; set; }
        public string layout_color { get; set; }
        public string logo { get; set; }
        public string signature_color { get; set; }
        public BrandingTemplates templates { get; set; }
        public string text_color { get; set; }
        public int show_survey_page { get; set; }
        public int show_csv { get; set; }
        public int show_biometric_hash { get; set; }
        public int show_welcome_page { get; set; }
    }
}
