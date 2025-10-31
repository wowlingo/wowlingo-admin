import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { config } from '../config';

const { Title } = Typography;
const { Option } = Select;

const ContractStatusTag = ({ status }: { status: string }) => {
    const statusMap = {
        //// 'Normal','Suspended','Terminated','Expired','Reserved'
        Reserved: { color: 'blue', text: '예약' },
        Terminated: { color: 'gray', text: '해지' },
        Expired: { color: 'gray', text: '만료' },
        Suspended: { color: 'gray', text: '중지' },
        Normal: { color: 'green', text: '활성' },
        Unrecognized: { color: 'red', text: '알수없음' }
    };

    let currentStatus = statusMap.Normal;
    switch (status) {
        case 'RESERVED':
            currentStatus = statusMap.Reserved; break;
        case 'TERMINATED':
            currentStatus = statusMap.Terminated; break;
        case 'EXPIRED':
            currentStatus = statusMap.Expired; break;
        case 'SUSPENDED':
            currentStatus = statusMap.Suspended; break;
        case 'NORMAL':
            currentStatus = statusMap.Normal; break;
        default:
            currentStatus = statusMap.Normal;
    }

    return (
        <Tag color={currentStatus.color}>
            {currentStatus.text}
        </Tag>
    );
};

interface Contract {
    key: React.Key;
    id: string;
    spaceId: string;

    plan: any;
    policy: any;

    signedAt: string;
    terminatedAt: string;
    expiredAt: string;

    status: string;
}

// Columns for the table
const columns: ColumnsType<Contract> = [
    {
        title: '계약 ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: '워크스페이스 ID',
        dataIndex: 'spaceId',
        key: 'spaceId',
    },
    {
        title: '플랜',
        dataIndex: ['plan', 'title'],
        key: 'planTitle',
    },
    {
        title: '계약 정책',
        dataIndex: ['policy', 'renewalDateRule', 'fixedDay'],
        key: 'renewalRule',
        render: (fixedDay) => {
            if (fixedDay !== undefined) {
                return `"fixedDay": ${fixedDay}`;
            }
            return null;
        },
    },
    {
        title: '계약 시작일',
        dataIndex: 'signedAt',
        key: 'signedAt',
        render: (timestamp: string) => (timestamp ? new Date(parseInt(timestamp) * 1000).toLocaleDateString() : null),
    },
    {
        title: '계약 종료일',
        dataIndex: 'terminatedAt',
        key: 'terminatedAt',
        render: (timestamp: string) => (timestamp ? new Date(parseInt(timestamp) * 1000).toLocaleDateString() : null),
    },
    {
        title: '계약 만료일',
        dataIndex: 'expiredAt',
        key: 'expiredAt',
        render: (timestamp: string) => (timestamp ? new Date(parseInt(timestamp) * 1000).toLocaleDateString() : null),
    },
    {
        title: '상태',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
            <ContractStatusTag status={status} />
        ),
    },
];


const ContractPage: React.FC = () => {
    const [contracts, setConstracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [terminatedDate, setTerminatedDate] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [isResumeModalVisible, setIsResumeModalVisible] = useState(false);

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

    const handleSearch = async () => {
        if (!workspaceId) { return; }

        setLoading(true);
        try {
            const response = await fetch(`${config.apiServer}/api/contracts?space_id=${workspaceId}`);
            const json = await response.json();

            // const contracts = json.anyContracts ?? [];
            const contracts = json.contracts ?? [];

            const processedData = contracts.map((item: any, index: number) => {
                console.log(item);
                // const { contract } = item;
                // const nowInSeconds = Date.now() / 1000;
                // let status = 'Unknown';

                // // 'Normal','Suspended','Terminated','Expired','Reserved'
                // if (contract.terminatedAt && parseInt(contract.terminatedAt) <= nowInSeconds) {
                //     status = 'Terminated';
                // } else if (contract.terminatedAt && parseInt(contract.terminatedAt) > nowInSeconds) {
                //     status = 'Terminating';
                // }
                // else if (parseInt(contract.expiredAt) < nowInSeconds) {
                //     status = 'Expired';
                // } else if (parseInt(contract.signedAt) < nowInSeconds) {
                //     status = 'Normal';
                // }

                return {
                    ...item,
                    key: item.id || index,
                    // status: status,
                };
            });
            setConstracts(processedData);

        } catch (error) {
            console.error('Failed to fetch payments:', error);
            // Handle error state here, e.g., show a notification
        }
        setLoading(false);
    };

    const handleCancelContract = async () => {
        setIsModalVisible(true);
    }

    const handleResumeContract = async () => {
        setIsResumeModalVisible(true);
    }

    const handleOk = async () => {
        try {
            // console.log(isResumeModalVisible);
            // var response = null;
            // if (isResumeModalVisible) {
            //     // 중지 계약 원복
            //     // https://dkt.agit.in/g/300064469/wall/443198325
            //     // 확인해보니 미납요금 완납 시 요금제가 자동으로 복원되어야 하는데 아직 프리플랜으로 보여져서요. 해당 스페이스는 미납요금을 계좌이체로 납부하고 요금제 복원을 요청주신 건이라, 기존 요금제로 변경 부탁드립니다!!
            //     response = await fetch(`${config.toolboxServer}/resume-suspended-space?space_id=${workspaceId}`, {
            //         method: 'GET',
            //     });
            // } else {
            //     // 계약 해지
            //     response = await fetch(`${config.toolboxServer}/contract/withdraw?space_id=${workspaceId}&terminated_date=${terminatedDate}`, {
            //         method: 'GET',
            //     });
            // }
            // console.log(response);

            // if (response === null || !response.ok) throw new Error('실패');

            success();
        } catch (err) {
            console.error(err);
            error();
        } finally {
            setIsModalVisible(false);
            setIsResumeModalVisible(false);
            setWorkspaceId('');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsResumeModalVisible(false);
        setWorkspaceId('');
    };

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <Title level={3}>전체 계약 조회</Title>
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Input placeholder="워크스페이스 ID"
                        value={workspaceId}
                        onChange={(e) => setWorkspaceId(e.target.value)} />
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>검색</Button>
                </Space>
            </div>
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button type="primary" onClick={handleCancelContract}>계약 해지</Button>
                    <Button onClick={handleResumeContract}>중지 계약 원복</Button>
                </Space>
            </div>
            <Table dataSource={contracts} columns={columns} loading={loading} rowKey="contractId" />
            <Modal
                title="계약 해지"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="해지"
                cancelText="취소"
            >
                <p>계약 해지 (플랜 FREE 변경) 하고자 하는 워크스페이스 ID를 입력하세요.</p>
                <Input
                    placeholder="워크스페이스 ID"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                />
                <p>계약 해지 날짜를 입력하세요.</p>
                <Input
                    placeholder="YYYY-MM-DD"
                    value={terminatedDate}
                    onChange={(e) => setTerminatedDate(e.target.value)}
                />
            </Modal>

            <Modal
                title="중지 계약 원복"
                visible={isResumeModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="원복"
                cancelText="취소"
            >
                <p>미납 요금에 의해 중지된 요금제를 대상으로 한다.</p>
                <p>우선 워크스페이스는 미납 요금의 납부를 우선으로 진행하여야 한다.</p>
                <Input
                    placeholder="워크스페이스 ID"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default ContractPage;