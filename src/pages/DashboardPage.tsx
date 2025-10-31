
import React from 'react';
import { Table, Tag, Typography } from 'antd';

const { Title } = Typography;


const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
      <Title level={3}>대시보드</Title>
    </div>
  );
};

export default DashboardPage;
