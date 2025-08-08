/*
 * Generator Code From MateralMergeBlock=>GeneratorServiceImplsCodeAsync
 */
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.Project;
using MateralReleaseCenter.ServerCenter.Abstractions.Services.Models.Project;

namespace MateralReleaseCenter.ServerCenter.Application.Services
{
    /// <summary>
    /// 项目服务
    /// </summary>
    public partial class ProjectServiceImpl : BaseServiceImpl<AddProjectModel, EditProjectModel, QueryProjectModel, ProjectDTO, ProjectListDTO, IProjectRepository, Project, IServerCenterUnitOfWork>, IProjectService, IScopedDependency<IProjectService>
    {
    }
}
