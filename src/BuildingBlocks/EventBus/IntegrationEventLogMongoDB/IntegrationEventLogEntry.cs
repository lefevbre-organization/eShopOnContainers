using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Linq;

namespace Lefebvre.eLefebvreOnContainers.BuildingBlocks.IntegrationEventLogMongoDB
{
    public class IntegrationEventLogEntry
    {
        private IntegrationEventLogEntry()
        {
        }

        public IntegrationEventLogEntry(IntegrationEvent @event, Guid transactionId)
        {
            EventId = @event.Id;
            CreationTime = @event.CreationDate;
            EventTypeName = @event.GetType().FullName;
            Content = JsonConvert.SerializeObject(@event);
            State = EventStateEnum.NotPublished;
            TimesSent = 0;
            TransactionId = transactionId.ToString();
        }

        [BsonId]
        [BsonElement("_id")]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; private set; }

        public Guid EventId { get; private set; }
        public string EventTypeName { get; private set; }

        [BsonIgnore]
        public string EventTypeShortName => EventTypeName.Split('.')?.Last();

        [BsonIgnore]
        public IntegrationEvent IntegrationEvent { get; private set; }

        public EventStateEnum State { get; set; }
        public int TimesSent { get; set; }
        public DateTime CreationTime { get; private set; }
        public string Content { get; private set; }
        public string TransactionId { get; private set; }

        //public IntegrationEventLogEntry DeserializeJsonContent(Type type)
        //{
        //    IntegrationEvent = JsonConvert.DeserializeObject(Content, type) as IntegrationEvent;
        //    return this;
        //}
    }
}