namespace EmailUserAccount.API.Model
{
    #region Using

    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;

    #endregion

    public abstract class MongoModel
    {
        [BsonExtraElements]
        public BsonDocument ExtraElements { get; set; }
    }
}