# Marketing Campaign API Test Page

## Prerequisites
1. Make sure your application is running: `npm run start:dev`
2. Ensure your database is set up and migrations are applied
3. Have a valid JWT token for authentication
4. Ensure your organization has at least one loyalty program created
5. Ensure your organization has at least one POS location configured

## Overview
This test page provides a comprehensive interface for testing the marketing campaign create and edit APIs. It's located at `/marketing/corporate-clients/campaign-test` and can be accessed from the Corporate Client Profile page.

## Features

### 1. Create Marketing Campaign
- **Form Fields:**
  - Campaign Name (required)
  - Campaign Type (PROMOCODE or DISCOUNT)
  - Launch Date (required)
  - End Date (optional)
  - Description (optional)
  - Loyalty Program (required)
  - POS Locations (required, multiple selection)
  - Discount Type (FIXED or PERCENTAGE)
  - Discount Value (required)
  - Promocode (required for PROMOCODE type)
  - Max Usage (optional)

### 2. Edit Marketing Campaign
- Update existing campaign details
- Modify discount values, promocodes, and usage limits
- Change POS locations

### 3. View Campaign Details
- Display comprehensive campaign information
- Show usage statistics
- Display creation and update timestamps

### 4. Comprehensive Testing
- Automated test suite that creates multiple campaign types
- Tests both create and update operations
- Logs all API responses and errors

### 5. Test Results Logging
- Real-time logging of all API calls
- Success/Error status tracking
- Response data display
- Timestamp tracking

### 6. Get Campaign by ID Testing
- Automatic API call when viewing campaign details
- Dedicated test button for independent testing
- Fallback to table data if API call fails
- Logs all get campaign by ID requests

## API Endpoints Tested

### Create Campaign
```
POST /loyalty/marketing-campaigns
```

### Update Campaign
```
PUT /loyalty/marketing-campaigns/{id}
```

### Get All Campaigns
```
GET /loyalty/marketing-campaigns
```

### Get Campaign by ID
```
GET /loyalty/marketing-campaigns/{id}
```

**Note**: This endpoint is automatically called when you click the "View Details" button in the campaigns table.

## Usage Instructions

1. **Access the Test Page:**
   - Navigate to `/marketing/corporate-clients`
   - Click on any corporate client to view their profile
   - Click the "Test Marketing Campaigns" button

2. **Create a New Campaign:**
   - Click "Create New Campaign"
   - Fill in the required fields
   - Submit the form
   - Check the test results table for API response

3. **Run Automated Tests:**
   - Click "Run Comprehensive Tests"
   - This will create test campaigns and update them
   - All results are logged in the test results table

4. **View Existing Campaigns:**
   - The page displays all existing campaigns in a table
   - Click the eye icon to view details (automatically calls GET /loyalty/marketing-campaigns/{id})
   - Click the edit icon to modify campaigns
   - Use "Test Get Campaign by ID" button to test the endpoint with the first campaign

5. **Monitor Test Results:**
   - All API calls are logged in the test results table
   - Success/Error status is color-coded
   - Full response data is displayed

## Data Sources

The test page fetches real data from your organization:
- **Loyalty Programs**: Fetched from `/user/loyalty/programs?organizationId={user.organizationId}`
- **POS Locations**: Fetched from `/user/organization/pos?organizationId={user.organizationId}`

The page automatically uses the current user's organization ID to fetch relevant data.

## Error Handling

- All API errors are caught and logged
- User-friendly error messages are displayed
- Detailed error information is available in the test results table

## Navigation

- Use the "Back to Corporate Clients" button to return to the main corporate clients page
- The page is accessible from the corporate client profile page

## Technical Details

- Built with React and TypeScript
- Uses Ant Design components for UI
- Integrates with the existing marketing API service
- Uses SWR for data fetching and caching
- Supports real-time form validation
- Responsive design for different screen sizes

## Testing Checklist

- [ ] Create campaign with promocode
- [ ] Create campaign without promocode
- [ ] Update campaign details
- [ ] View campaign information
- [ ] Test validation errors
- [ ] Test API error responses
- [ ] Verify data persistence
- [ ] Check response format compliance
