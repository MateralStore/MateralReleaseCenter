using MateralReleaseCenter.DeployServer.Abstractions.DTO.DefaultData;
using MateralReleaseCenter.DeployServer.Abstractions.RequestModel.DefaultData;

namespace MateralReleaseCenter.DeployServer.Application.Controllers;

public partial class DefaultDataController
{
    /// <inheritdoc/>
    [HttpPost, AllowAnonymous]
    public override Task<CollectionResultModel<DefaultDataListDTO>> GetListAsync(QueryDefaultDataRequestModel requestModel)
        => base.GetListAsync(requestModel);
}