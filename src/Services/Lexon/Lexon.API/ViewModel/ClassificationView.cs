namespace Lexon.API.Model
{
    public class ClassificationView
    {
        public short? idType { get; set; }
        public string bbdd { get; set; }
        public string idUser { get; set; }
        public long idRelated { get; set; }
        //public long idCompany { get; set; }
    }

    /// <summary>
    /// Use to search classifications
    /// </summary>
    public class ClassificationSearch: ClassificationView
    {


        /// <summary> string with search filter </summary>
        public string search { get; set; }

        /// <summary>id to filter (use in documents and folders entities</summary>
        public long? idFilter { get; set; }

        /// <summary>quantity of records to return , by default 20,  all = 0</summary>
        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }

        /// <summary> string with the id of the mail to searchry>
        public string idMail { get; set; }

    }
}