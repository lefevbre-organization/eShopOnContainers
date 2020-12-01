using Microsoft.Extensions.FileProviders.Composite;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class ConferenceModel : ConferenceSimple
    {
        public string name { get; set; }

        public Contents[] contents { get; set; }

    }

    public class Contents
    {
        public string name { get; set; }
        public Channel[] channels { get; set; }

        public ChannelBundle[] channelBundles { get; set; }
    }



  //{
  //"name": "tu_01",
  //  "contents": [{
  //      "name": "audio",
  //      "channels": [{
  //          "endpoint": "aud01",
  //          "channel-bundle-id": "aud01",
  //          "expire": 60
  //      }]
  //  }, {
  //  "endpoint": "vid01",
  //      "channel-bundle-id": "vid01",
  //      "name": "video",
  //      "channels": [{
  //      "endpoint": "vid01",
  //          "channel-bundle-id": "vid01",
  //          "expire": 60
  //      }]
  //  }]}
}