import React, { useEffect, useState } from 'react';
import { List, Modal, Input, message } from 'antd';
import { WarningTwoTone } from '@ant-design/icons';
import Item from 'antd/es/list/Item';

interface Usage {
    key: number;
    title: string;
    description: string;
}

const UsagePage: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [list, setList] = useState<Usage[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [currentItem, setCurrentItem] = useState<Usage>();

    useEffect(() => {
        setList([
            {
                key: 1,
                title: '월별 사용자 통계 API - v1',
                description: '현재일 기준 -90일치만 가능하다. 실시간으로 서버가 쿼리해서 뽑는 방식이기 때문에 서버에 부하가 있다. 따라서 아껴쓸것. Daily 사용량을 체크한다.',
            },
            {
                key: 2,
                title: '월별 사용자 통계 API - v2',
                description: '오브젝트 스토리지에 저장된 데이터를 가져오는 방식. 2023-05 이전 데이터는 오브젝트 스토리지에 쌓여있지 않아서 가져올 수가 없다. Monthly 사용량을 체크한다.',
            },
        ]);
    }, []);

    const success = () => {
        messageApi.open({
            type: 'success',
            content: '요청 성공 하였습니다',
        });
    };

    const error = () => {
        messageApi.open({
            type: 'error',
            content: '요청 실패 하였습니다',
        });
    };

    const handleOk = async () => {
        try {
            var path = ``;
            if (currentItem?.key === 1) {
                path = `/excel?space_ids=${workspaceId}&from_time=${startDate}&to_time=${endDate}`;
            }
            else if (currentItem?.key === 2) {
                path = `/excel_v2?space_id=${workspaceId}&start_date=${startDate}&end_date=${endDate}`;
            }
            // "proxy": "https://reseller-papi.stage.kakaowork.com"
            const response = await fetch(`/api/usages${path}`, {
                method: 'GET',
            });
            console.log(response);

            if (!response.ok) throw new Error('실패');

            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'download.csv';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = decodeURIComponent(filenameMatch[1]);
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            success();
        } catch (err) {
            console.error(err);
            error();
        } finally {
            setIsModalVisible(false);
            setWorkspaceId('');
            setStartDate('');
            setEndDate('')

        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setWorkspaceId('');
        setStartDate('');
        setEndDate('');
    };

    const handleClickItem = (item: Usage) => {
        setCurrentItem(item);
        console.log('현재 선택된 아이템:', item);

        setIsModalVisible(true);
    };

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <List
                className="usage-list"
                itemLayout="horizontal"
                dataSource={list}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <span
                                key="download"
                                style={{ color: '#1677ff', cursor: 'pointer' }}
                                onClick={() => handleClickItem(item)}
                            >
                                다운로드
                            </span>,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<WarningTwoTone twoToneColor="#eb2f96" />}
                            title={item.title}
                            description={item.description}
                        />
                    </List.Item>
                )}
            />

            <Modal
                title={currentItem?.title}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="다운로드"
                cancelText="취소"
            >
                <p>워크스페이스 ID를 입력하세요.</p>
                <Input
                    placeholder="워크스페이스 ID"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                />
                <p>시작날짜를 입력하세요.</p>
                <Input
                    placeholder={
                        currentItem?.key === 1 ? 'YYYY-MM-DD' :
                            currentItem?.key === 2 ? 'YYYY-MM' : ''
                    }
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <p>종료날짜를 입력하세요.</p>
                <Input
                    placeholder={
                        currentItem?.key === 1 ? 'YYYY-MM-DD' :
                            currentItem?.key === 2 ? 'YYYY-MM' : ''
                    }
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default UsagePage;