using Microsoft.EntityFrameworkCore.Design;

namespace MateralReleaseCenter.Authority.Repository;

/// <summary>
/// Authority数据库上下文工厂
/// </summary>
public class AuthorityDBContextFactory : BaseDBContextFactory<AuthorityDBContext>, IDesignTimeDbContextFactory<AuthorityDBContext>
{
    /// <summary>
    /// 数据库路径
    /// </summary>
    protected override string DBPath => "./Authority.db";
}
