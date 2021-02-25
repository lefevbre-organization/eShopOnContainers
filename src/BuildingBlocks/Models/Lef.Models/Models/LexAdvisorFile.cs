
namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class LexAdvisorFile
    {
        //[{"code": "ConUsuarioSinTipo/000001/2020", "Description": "3 - Proceso de desahucio sin posibilidad de enervación", "IdExpedient": 3},
        //{"code": "2019/16", "Description": "16 - Derecho de Familia. Liquidación de sociedad de gananciales", "IdExpedient": 16}, 
        //{"code": "2019/134", "Description": "134 - Juicio falta de lesiones", "IdExpedient": 134}, 
        //{"code": "2019/171", "Description": "171 - Reclamación pérdida de maletas Iberia", "IdExpedient": 171},
        //{"code": "2019/174", "Description": "174 - Despido injustificado contra \"Juan Carlos Lopez\"", "IdExpedient": 174}, 
        //{"code": "2019/188", "Description": "188 - Regulación de Empleo", "IdExpedient": 188}, 
        //{"code": "2019/194", "Description": "194 - reclamacion del FOGASA", "IdExpedient": 194}]

        public string Code { get; set; }
        public string Description { get; set; }
        public long IdExpedient { get; set; }

    }
}