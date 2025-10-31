
import React, { useEffect, useState } from 'react';
import {
  PieChartOutlined,
  ContainerOutlined,
  CreditCardOutlined,
  InboxOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import UnitPage from './pages/UnitPage';
import QuestPage from './pages/QuestPage';
import ItemPage from './pages/ItemPage';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('학습/문제 관리', 'sub1', <InboxOutlined />, [
    getItem('학습 관리', '/quests'),
    getItem('문제 관리', '/items'),
    getItem('문제 유닛 관리', '/units'),
  ]),
  getItem('설정', '/settings', <SettingOutlined />),
];

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState<React.ReactNode[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    updateBreadcrumb(location.pathname);
  }, [location.pathname])

  const updateBreadcrumb = (path: string) => {
    for (const item of items) {
      if (!item) continue;
      if (!('label' in item)) continue;

      if ('children' in item && item.children) {
        const subItem = (item.children as MenuItem[]).find(child => child?.key === path);

        if (subItem) {
          if (!('label' in subItem)) continue;

          setBreadcrumbItems([item.label, subItem.label]);
          return;
        }
      } else if (item?.key === path) {
        setBreadcrumbItems([item.label]);
        return;
      }
    }
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    updateBreadcrumb(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['/']} selectedKeys={[location.pathname]} mode="inline" items={items} onClick={handleMenuClick} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {breadcrumbItems.map((item, index) => (
              <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/quests" element={<QuestPage />} />
            <Route path="/items" element={<ItemPage />} />
            <Route path="/units" element={<UnitPage />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          My Settlement Dashboard ©2025 Created with Ant Design
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;