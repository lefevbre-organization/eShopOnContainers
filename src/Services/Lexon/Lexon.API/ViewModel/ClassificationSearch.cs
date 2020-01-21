namespace Lexon.API.Model
{
    /// <summary>
    /// Use to search classifications
    /// </summary>
    public class ClassificationSearch: ClassificationView
    {
       
        /// <summary>quantity of records to return , by default 20,  all = 0</summary>
        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }



    }

    public class EntitySearch: EntityView
    {        
        /// <summary>id to filter (use in documents and folders entities</summary>
        public long? idFilter { get; set; }
        /// <summary> string with search filter </summary>
        public string search { get; set; }
        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }

    }
}