﻿namespace GrpcLexon
{
    public class LexonMySqlService  //: Lexon.LexonBase
    {
        //private readonly IUsersRepository _repository;
        //private readonly ILogger<LexonMySqlService> _logger;

        //public LexonMySqlService(IUsersRepository repository, ILogger<LexonMySqlService> logger)
        //{
        //    _repository = repository;
        //    _logger = logger;
        //}

        //[AllowAnonymous]
        //public override async Task<CustomerBasketResponse> GetBasketById(BasketRequest request, ServerCallContext context)
        //{
        //    _logger.LogInformation("Begin grpc call from method {Method} for basket id {Id}", context.Method, request.Id);

        //    var data = await _repository.Ge(request.Id);

        //    if (data != null)
        //    {
        //        context.Status = new Status(StatusCode.OK, $"Basket with id {request.Id} do exist");

        //        return MapToCustomerBasketResponse(data);
        //    }
        //    else
        //    {
        //        context.Status = new Status(StatusCode.NotFound, $"Basket with id {request.Id} do not exist");
        //    }

        //    return new CustomerBasketResponse();
        //}

        //public override async Task<CustomerBasketResponse> UpdateBasket(CustomerBasketRequest request, ServerCallContext context)
        //{
        //    _logger.LogInformation("Begin grpc call BasketService.UpdateBasketAsync for buyer id {Buyerid}", request.Buyerid);

        //    var customerBasket = MapToCustomerBasket(request);

        //    var response = await _repository.UpdateBasketAsync(customerBasket);

        //    if (response != null)
        //    {
        //        return MapToCustomerBasketResponse(response);
        //    }

        //    context.Status = new Status(StatusCode.NotFound, $"Basket with buyer id {request.Buyerid} do not exist");

        //    return null;
        //}

        //private CustomerBasketResponse MapToCustomerBasketResponse(CustomerBasket customerBasket)
        //{
        //    var response = new CustomerBasketResponse
        //    {
        //        Buyerid = customerBasket.BuyerId
        //    };

        //    customerBasket.Items.ForEach(item => response.Items.Add(new BasketItemResponse
        //    {
        //        Id = item.Id,
        //        Oldunitprice = (double)item.OldUnitPrice,
        //        Pictureurl = item.PictureUrl,
        //        Productid = item.ProductId,
        //        Productname = item.ProductName,
        //        Quantity = item.Quantity,
        //        Unitprice = (double)item.UnitPrice
        //    }));

        //    return response;
        //}

        //private CustomerBasket MapToCustomerBasket(CustomerBasketRequest customerBasketRequest)
        //{
        //    var response = new CustomerBasket
        //    {
        //        BuyerId = customerBasketRequest.Buyerid
        //    };

        //    customerBasketRequest.Items.ToList().ForEach(item => response.Items.Add(new BasketItem
        //    {
        //        Id = item.Id,
        //        OldUnitPrice = (decimal)item.Oldunitprice,
        //        PictureUrl = item.Pictureurl,
        //        ProductId = item.Productid,
        //        ProductName = item.Productname,
        //        Quantity = item.Quantity,
        //        UnitPrice = (decimal)item.Unitprice
        //    }));

        //    return response;
        //}
    }
}