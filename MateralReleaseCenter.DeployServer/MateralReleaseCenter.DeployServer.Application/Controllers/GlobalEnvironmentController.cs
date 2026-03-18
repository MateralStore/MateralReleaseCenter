using MateralReleaseCenter.DeployServer.Abstractions.DTO.GlobalEnvironment;
using MateralReleaseCenter.DeployServer.Abstractions.RequestModel.GlobalEnvironment;

namespace MateralReleaseCenter.DeployServer.Application.Controllers;

public partial class GlobalEnvironmentController
{
    /// <inheritdoc/>
    [HttpPost, AllowAnonymous]
    public override Task<CollectionResultModel<GlobalEnvironmentListDTO>> GetListAsync(QueryGlobalEnvironmentRequestModel requestModel)
        => base.GetListAsync(requestModel);
}