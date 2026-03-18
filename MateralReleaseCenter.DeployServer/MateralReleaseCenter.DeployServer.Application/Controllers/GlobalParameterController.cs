using MateralReleaseCenter.DeployServer.Abstractions.DTO.GlobalParameter;
using MateralReleaseCenter.DeployServer.Abstractions.RequestModel.GlobalParameter;

namespace MateralReleaseCenter.DeployServer.Application.Controllers;

public partial class GlobalParameterController
{
    /// <inheritdoc/>
    [HttpPost, AllowAnonymous]
    public override Task<CollectionResultModel<GlobalParameterListDTO>> GetListAsync(QueryGlobalParameterRequestModel requestModel)
        => base.GetListAsync(requestModel);
}