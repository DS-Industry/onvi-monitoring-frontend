import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Table,
  Space,
  Modal,
  Descriptions,
  Tag,
  Divider,
  Alert,
  Spin,
  InputNumber,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSWR from 'swr';

import {
  createMarketingCampaign,
  updateMarketingCampaign,
  getMarketingCampaigns,
  getMarketingCampaignById,
  getLoyaltyPrograms,
  CampaignType,
  CampaignStatus,
  DiscountType,
  MarketingCampaignRequest,
  UpdateMarketingCampaignRequest,
  MarketingCampaignResponse,
  LoyaltyProgramsResponse,
} from '@/services/api/marketing';
import { getPoses, PosResponse } from '@/services/api/equipment';
import { useUser } from '@/hooks/useUserStore';
import api from '@/config/axiosConfig';

const { Option } = Select;
const { TextArea } = Input;

const MarketingCampaignTest: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUser();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // State management
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaignResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [selectedLoyaltyProgram, setSelectedLoyaltyProgram] = useState<number | null>(null);

  // Fetch loyalty programs for the user's organization
  const {
    data: loyaltyProgramsData,
    isLoading: isLoadingLoyaltyPrograms,
  } = useSWR<LoyaltyProgramsResponse[]>(
    user.organizationId ? ['loyalty-programs', user.organizationId] : null,
    () => getLoyaltyPrograms(user.organizationId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  // Fetch POS locations for the user's organization
  const {
    data: posData,
    isLoading: isLoadingPos,
  } = useSWR<PosResponse[]>(
    user.organizationId ? ['pos-locations', user.organizationId] : null,
    () => getPoses({ organizationId: user.organizationId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  // Fetch campaigns
  const {
    data: campaigns,
    error,
    isLoading: isLoadingCampaigns,
    mutate: refreshCampaigns,
  } = useSWR<MarketingCampaignResponse[]>(
    'marketing-campaigns',
    () => getMarketingCampaigns(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  // Test results table columns
  const testColumns = [
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'SUCCESS' ? 'green' : status === 'ERROR' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Response',
      dataIndex: 'response',
      key: 'response',
      render: (response: any) => (
        <div style={{ maxWidth: 300, wordBreak: 'break-word' }}>
          <pre style={{ fontSize: '12px', margin: 0 }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  // Campaigns table columns
  const campaignColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: CampaignType) => (
        <Tag color={type === CampaignType.PROMOCODE ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: CampaignStatus) => {
        const colors = {
          [CampaignStatus.DRAFT]: 'default',
          [CampaignStatus.ACTIVE]: 'green',
          [CampaignStatus.PAUSED]: 'orange',
          [CampaignStatus.ENDED]: 'red',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 150,
      render: (record: MarketingCampaignResponse) => (
        <span>
          {record.discountValue}
          {record.discountType === DiscountType.PERCENTAGE ? '%' : ' ₽'}
        </span>
      ),
    },
    {
      title: 'Promocode',
      dataIndex: 'promocode',
      key: 'promocode',
      width: 120,
      render: (promocode: string) => promocode || '-',
    },
    {
      title: 'Usage',
      key: 'usage',
      width: 100,
      render: (record: MarketingCampaignResponse) => (
        <span>
          {record.currentUsage}/{record.maxUsage || '∞'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: MarketingCampaignResponse) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewCampaign(record)}
            size="small"
            title="View Details (calls GET /loyalty/marketing-campaigns/{id})"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditCampaign(record)}
            size="small"
            title="Edit Campaign"
          />
        </Space>
      ),
    },
  ];

  // Handle create campaign
  const handleCreateCampaign = async (values: any) => {
    try {
      setIsLoading(true);
      
      const campaignData: MarketingCampaignRequest = {
        name: values.name,
        type: values.type,
        launchDate: values.launchDate.toISOString(),
        endDate: values.endDate?.toISOString(),
        description: values.description,
        ltyProgramId: values.ltyProgramId,
        posIds: values.posIds,
        discountType: values.discountType,
        discountValue: values.discountValue,
        promocode: values.promocode,
        maxUsage: values.maxUsage,
      };

      const response = await createMarketingCampaign(campaignData);
      
      setTestResults(prev => [...prev, {
        testName: 'Create Marketing Campaign',
        status: 'SUCCESS',
        response: response,
        timestamp: new Date().toISOString(),
      }]);

      message.success('Campaign created successfully!');
      setIsCreateModalVisible(false);
      form.resetFields();
      refreshCampaigns();
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        testName: 'Create Marketing Campaign',
        status: 'ERROR',
        response: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
      }]);
      
      message.error('Failed to create campaign');
      console.error('Create campaign error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit campaign
  const handleEditCampaign = (campaign: MarketingCampaignResponse) => {
    setSelectedCampaign(campaign);
    editForm.setFieldsValue({
      name: campaign.name,
      description: campaign.description,
      endDate: campaign.endDate ? dayjs(campaign.endDate) : undefined,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      promocode: campaign.promocode,
      maxUsage: campaign.maxUsage,
      posIds: [1, 2], // Mock POS IDs for edit
    });
    setIsEditModalVisible(true);
  };

  // Handle update campaign
  const handleUpdateCampaign = async (values: any) => {
    if (!selectedCampaign) return;

    try {
      setIsLoading(true);
      
      const updateData: UpdateMarketingCampaignRequest = {
        name: values.name,
        description: values.description,
        endDate: values.endDate?.toISOString(),
        discountType: values.discountType,
        discountValue: values.discountValue,
        promocode: values.promocode,
        maxUsage: values.maxUsage,
        posIds: values.posIds,
      };

      const response = await updateMarketingCampaign(selectedCampaign.id, updateData);
      
      setTestResults(prev => [...prev, {
        testName: 'Update Marketing Campaign',
        status: 'SUCCESS',
        response: response,
        timestamp: new Date().toISOString(),
      }]);

      message.success('Campaign updated successfully!');
      setIsEditModalVisible(false);
      editForm.resetFields();
      refreshCampaigns();
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        testName: 'Update Marketing Campaign',
        status: 'ERROR',
        response: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
      }]);
      
      message.error('Failed to update campaign');
      console.error('Update campaign error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view campaign
  const handleViewCampaign = async (campaign: MarketingCampaignResponse) => {
    try {
      setIsLoading(true);
      
      // Call the get campaign by ID API
      const detailedCampaign = await getMarketingCampaignById(campaign.id);
      
      setTestResults(prev => [...prev, {
        testName: 'Get Marketing Campaign by ID',
        status: 'SUCCESS',
        response: detailedCampaign,
        timestamp: new Date().toISOString(),
      }]);

      setSelectedCampaign(detailedCampaign);
      setIsViewModalVisible(true);
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        testName: 'Get Marketing Campaign by ID',
        status: 'ERROR',
        response: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
      }]);
      
      message.error('Failed to fetch campaign details');
      console.error('Get campaign by ID error:', error);
      
      // Fallback to the campaign data from the table
      setSelectedCampaign(campaign);
      setIsViewModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Run comprehensive tests
  const runComprehensiveTests = async () => {
    // Use first available loyalty program and POS locations
    const firstLoyaltyProgram = loyaltyProgramsData?.[0]?.props;
    const firstPosLocations = posData?.slice(0, 2).map(pos => pos.id) || [1];

    if (!firstLoyaltyProgram) {
      message.error('No loyalty programs available for testing');
      return;
    }

    const tests = [
      {
        name: 'Create Campaign with Promocode',
        data: {
          name: 'Test Promocode Campaign',
          type: CampaignType.PROMOCODE,
          launchDate: dayjs().add(1, 'day').toISOString(),
          endDate: dayjs().add(30, 'days').toISOString(),
          description: 'Test campaign with promocode',
          ltyProgramId: firstLoyaltyProgram.id,
          posIds: firstPosLocations,
          discountType: DiscountType.PERCENTAGE,
          discountValue: 20,
          promocode: 'TEST20',
          maxUsage: 100,
        },
      },
      {
        name: 'Create Campaign without Promocode',
        data: {
          name: 'Test Discount Campaign',
          type: CampaignType.DISCOUNT,
          launchDate: dayjs().add(1, 'day').toISOString(),
          endDate: dayjs().add(30, 'days').toISOString(),
          description: 'Test campaign without promocode',
          ltyProgramId: firstLoyaltyProgram.id,
          posIds: [firstPosLocations[0]],
          discountType: DiscountType.FIXED,
          discountValue: 50,
          maxUsage: 200,
        },
      },
    ];

    for (const test of tests) {
      try {
        setIsLoading(true);
        const response = await createMarketingCampaign(test.data);
        
        setTestResults(prev => [...prev, {
          testName: test.name,
          status: 'SUCCESS',
          response: response,
          timestamp: new Date().toISOString(),
        }]);

        // Test update if campaign was created
        if (response.id) {
          const updateResponse = await updateMarketingCampaign(response.id, {
            name: `Updated ${test.data.name}`,
            discountValue: test.data.discountValue + 5,
          });

          setTestResults(prev => [...prev, {
            testName: `Update ${test.name}`,
            status: 'SUCCESS',
            response: updateResponse,
            timestamp: new Date().toISOString(),
          }]);

          // Test get campaign by ID
          const getCampaignResponse = await getMarketingCampaignById(response.id);
          
          setTestResults(prev => [...prev, {
            testName: `Get Campaign by ID (${response.id})`,
            status: 'SUCCESS',
            response: getCampaignResponse,
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch (error: any) {
        setTestResults(prev => [...prev, {
          testName: test.name,
          status: 'ERROR',
          response: error.response?.data || error.message,
          timestamp: new Date().toISOString(),
        }]);
      }
    }
    
    setIsLoading(false);
    refreshCampaigns();
  };

  // Test get campaign by ID
  const testGetCampaignById = async (campaignId: number) => {
    try {
      setIsLoading(true);
      const campaign = await getMarketingCampaignById(campaignId);
      
      setTestResults(prev => [...prev, {
        testName: `Get Campaign by ID (${campaignId})`,
        status: 'SUCCESS',
        response: campaign,
        timestamp: new Date().toISOString(),
      }]);

      message.success(`Successfully fetched campaign ${campaignId}`);
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        testName: `Get Campaign by ID (${campaignId})`,
        status: 'ERROR',
        response: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
      }]);
      
      message.error(`Failed to fetch campaign ${campaignId}`);
      console.error('Get campaign by ID error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear test results
  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/marketing/corporate-clients')}
          className="mb-4"
        >
          Back to Corporate Clients
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Marketing Campaign API Testing
        </h1>
        <Alert
          message="API Testing Environment"
          description="This page allows you to test the marketing campaign create and edit APIs. All requests will be logged in the test results table below."
          type="info"
          showIcon
          className="mb-4"
        />
      </div>

      {/* Action Buttons */}
      <Card className="mb-6">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
            disabled={!loyaltyProgramsData?.length || !posData?.length}
          >
            Create New Campaign
          </Button>
          <Button
            icon={<ExperimentOutlined />}
            onClick={runComprehensiveTests}
            loading={isLoading}
            disabled={!loyaltyProgramsData?.length || !posData?.length}
          >
            Run Comprehensive Tests
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => campaigns?.[0] && testGetCampaignById(campaigns[0].id)}
            loading={isLoading}
            disabled={!campaigns?.length}
          >
            Test Get Campaign by ID
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refreshCampaigns()}
            loading={isLoadingCampaigns}
          >
            Refresh Campaigns
          </Button>
          <Button onClick={clearTestResults}>
            Clear Test Results
          </Button>
        </Space>
      </Card>

      {/* Data Status */}
      {(isLoadingLoyaltyPrograms || isLoadingPos) && (
        <Alert
          message="Loading Data"
          description="Loading loyalty programs and POS locations..."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      {!isLoadingLoyaltyPrograms && !isLoadingPos && (!loyaltyProgramsData?.length || !posData?.length) && (
        <Alert
          message="No Data Available"
          description="No loyalty programs or POS locations found for your organization. Please ensure you have access to the required data."
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {/* Campaigns Table */}
      <Card title="Existing Campaigns" className="mb-6">
        <Table
          columns={campaignColumns}
          dataSource={campaigns || []}
          rowKey="id"
          loading={isLoadingCampaigns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Test Results Table */}
      <Card title="Test Results" className="mb-6">
        <Table
          columns={testColumns}
          dataSource={testResults}
          rowKey={(record, index) => `${record.testName}-${index}`}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create Campaign Modal */}
      <Modal
        title="Create Marketing Campaign"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCampaign}
        >
          <Form.Item
            label="Campaign Name"
            name="name"
            rules={[{ required: true, message: 'Please enter campaign name' }]}
          >
            <Input placeholder="Enter campaign name" />
          </Form.Item>

          <Form.Item
            label="Campaign Type"
            name="type"
            rules={[{ required: true, message: 'Please select campaign type' }]}
          >
            <Select placeholder="Select campaign type">
              <Option value={CampaignType.PROMOCODE}>Promocode</Option>
              <Option value={CampaignType.DISCOUNT}>Discount</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Launch Date"
            name="launchDate"
            rules={[{ required: true, message: 'Please select launch date' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter campaign description" />
          </Form.Item>

          <Form.Item
            label="Loyalty Program"
            name="ltyProgramId"
            rules={[{ required: true, message: 'Please select loyalty program' }]}
          >
            <Select 
              placeholder="Select loyalty program"
              loading={isLoadingLoyaltyPrograms}
              onChange={(value) => setSelectedLoyaltyProgram(value)}
            >
              {loyaltyProgramsData?.map(program => (
                <Option key={program.props.id} value={program.props.id}>
                  {program.props.name}
                </Option>
              )) || []}
            </Select>
          </Form.Item>

          <Form.Item
            label="POS Locations"
            name="posIds"
            rules={[{ required: true, message: 'Please select POS locations' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select POS locations"
              showSearch
              loading={isLoadingPos}
            >
              {posData?.map(pos => (
                <Option key={pos.id} value={pos.id}>
                  {pos.name}
                </Option>
              )) || []}
            </Select>
          </Form.Item>

          <Form.Item
            label="Discount Type"
            name="discountType"
            rules={[{ required: true, message: 'Please select discount type' }]}
          >
            <Select placeholder="Select discount type">
              <Option value={DiscountType.FIXED}>Fixed Amount</Option>
              <Option value={DiscountType.PERCENTAGE}>Percentage</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Discount Value"
            name="discountValue"
            rules={[{ required: true, message: 'Please enter discount value' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter discount value"
            />
          </Form.Item>

          <Form.Item
            label="Promocode"
            name="promocode"
            dependencies={['type']}
            rules={[
              ({ getFieldValue }) => ({
                required: getFieldValue('type') === CampaignType.PROMOCODE,
                message: 'Promocode is required for promocode campaigns',
              }),
            ]}
          >
            <Input placeholder="Enter promocode" />
          </Form.Item>

          <Form.Item
            label="Max Usage"
            name="maxUsage"
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Enter max usage limit"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Campaign
              </Button>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        title="Edit Marketing Campaign"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateCampaign}
        >
          <Form.Item
            label="Campaign Name"
            name="name"
            rules={[{ required: true, message: 'Please enter campaign name' }]}
          >
            <Input placeholder="Enter campaign name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter campaign description" />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Discount Type"
            name="discountType"
            rules={[{ required: true, message: 'Please select discount type' }]}
          >
            <Select placeholder="Select discount type">
              <Option value={DiscountType.FIXED}>Fixed Amount</Option>
              <Option value={DiscountType.PERCENTAGE}>Percentage</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Discount Value"
            name="discountValue"
            rules={[{ required: true, message: 'Please enter discount value' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter discount value"
            />
          </Form.Item>

          <Form.Item
            label="Promocode"
            name="promocode"
          >
            <Input placeholder="Enter promocode" />
          </Form.Item>

          <Form.Item
            label="Max Usage"
            name="maxUsage"
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Enter max usage limit"
            />
          </Form.Item>

          <Form.Item
            label="POS Locations"
            name="posIds"
          >
            <Select
              mode="multiple"
              placeholder="Select POS locations"
              showSearch
              loading={isLoadingPos}
            >
              {posData?.map(pos => (
                <Option key={pos.id} value={pos.id}>
                  {pos.name}
                </Option>
              )) || []}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Update Campaign
              </Button>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Campaign Modal */}
      <Modal
        title="Campaign Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedCampaign && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedCampaign.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedCampaign.name}</Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={selectedCampaign.type === CampaignType.PROMOCODE ? 'blue' : 'green'}>
                {selectedCampaign.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedCampaign.status === CampaignStatus.ACTIVE ? 'green' :
                selectedCampaign.status === CampaignStatus.PAUSED ? 'orange' :
                selectedCampaign.status === CampaignStatus.ENDED ? 'red' : 'default'
              }>
                {selectedCampaign.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Launch Date">
              {new Date(selectedCampaign.launchDate).toLocaleString()}
            </Descriptions.Item>
            {selectedCampaign.endDate && (
              <Descriptions.Item label="End Date">
                {new Date(selectedCampaign.endDate).toLocaleString()}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Description">
              {selectedCampaign.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Loyalty Program">
              {selectedCampaign.ltyProgramName}
            </Descriptions.Item>
            <Descriptions.Item label="Discount">
              {selectedCampaign.discountValue}
              {selectedCampaign.discountType === DiscountType.PERCENTAGE ? '%' : ' ₽'}
            </Descriptions.Item>
            <Descriptions.Item label="Promocode">
              {selectedCampaign.promocode || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Usage">
              {selectedCampaign.currentUsage}/{selectedCampaign.maxUsage || '∞'}
            </Descriptions.Item>
            <Descriptions.Item label="POS Count">
              {selectedCampaign.posCount}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(selectedCampaign.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(selectedCampaign.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {selectedCampaign.createdBy.name}
            </Descriptions.Item>
            <Descriptions.Item label="Updated By">
              {selectedCampaign.updatedBy.name}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MarketingCampaignTest;
