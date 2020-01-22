namespace Lexon.API.Model
{
    /// <summary>
    /// Use to search classifications
    /// </summary>
    public class ClassificationSearch : ClassificationView
    {
        /// <summary> string with the id of the mail to search</summary>
        public string idMail { get; set; }

        /// <summary>quantity of records to return , by default 20,  all = 0</summary>
        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }
    }
}