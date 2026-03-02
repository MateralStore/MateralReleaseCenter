import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export function HomePage() {
  return (
    <Typography>
      <Title level={2}>欢迎使用 Materal 发布中心</Title>
      <Paragraph>这是一个配置管理和应用发布平台，您可以通过左侧菜单导航到各个功能模块。</Paragraph>
    </Typography>
  )
}

export default HomePage
