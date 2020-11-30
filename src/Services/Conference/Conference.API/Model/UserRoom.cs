using System.Xml;
using System.Xml.Serialization;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class UserRoom { 
        public string idNavision { get; set; }
        public Room room { get; set; }
    }


    [XmlRoot("XmmpBody")]
    public class XmmpBody
    {

        public XmmpStringAttribute sid { get; set; }
        public XmmpStringAttribute secure { get; set; }
        public XmmpStringAttribute requests { get; set; }
        public XmmpStringAttribute xmlns { get; set; }

        // <body authid='8ff9d004-78a4-41c0-b561-a8c82768d2e1' 
        //inactivity='60' hold='1' polling='5' xmlns:stream='http://etherx.jabber.org/streams' 
        // xmpp:version='1.0' wait='60' 
        // sid='8ff9d004-78a4-41c0-b561-a8c82768d2e1' ver='1.6' from='meet.jitsi' 
        // secure='true' xmlns:xmpp='urn:xmpp:xbosh' 
        // xmlns='http://jabber.org/protocol/httpbind' requests='2'>


        //[XmlArray]
        //[XmlArrayItem(ElementName = "MyListItem")]
        //public List MyList { get; set; }
    }

    public class XmmpStringAttribute
    {
        [XmlAttribute("value")]
        public string Value { get; set; }
    }



}