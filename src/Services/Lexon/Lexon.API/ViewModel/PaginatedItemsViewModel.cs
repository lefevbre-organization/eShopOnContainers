namespace Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel
{
    using System.Collections.Generic;

    public class PaginatedItemsViewModel<TEntity> where TEntity : class
    {
        public int PageIndex { get; private set; }

        public int PageSize { get; private set; }

        public long? Count { get; set; }

        public IEnumerable<TEntity> Data { get; private set; }

        public PaginatedItemsViewModel(int pageIndex, int pageSize, long? count, IEnumerable<TEntity> data)
        {
            this.PageIndex = pageIndex;
            this.PageSize = pageSize;
            this.Count = count;
            this.Data = data;
        }

        public PaginatedItemsViewModel(int pageIndex, int pageSize):this(pageIndex, pageSize, 0, new List<TEntity>() )
        { }

        public PaginatedItemsViewModel() : this(0, 0, 0, new List<TEntity>())
        { }
    }
}