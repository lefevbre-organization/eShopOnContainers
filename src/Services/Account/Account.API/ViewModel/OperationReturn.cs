namespace Account.API.ViewModel
{
    public class OperationReturn
    {
        public object Result { get; set; }
        public EStatusOpetation Status { get; set; }
        public string Description { get; set; }
    }

    public enum EStatusOpetation { Ok = 1, Error = -1, Exception = -2 }
}
