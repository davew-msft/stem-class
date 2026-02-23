/**
 * Test script for Azure AD Authentication
 * 
 * This script tests if the Azure AD (Entra ID) Service Principal
 * authentication is configured correctly and can obtain tokens
 * from Azure OpenAI.
 */

require('dotenv').config();
const aiService = require('./backend/src/services/aiService');

async function testAuthentication() {
  console.log('🔐 Testing Azure AD Authentication...\n');
  
  // Check environment variables
  console.log('📋 Checking Azure AD configuration:');
  const requiredVars = [
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_ID',
    'AZURE_CLIENT_SECRET',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_DEPLOYMENT_NAME'
  ];
  
  let allConfigured = true;
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const isSet = value && value.trim() !== '';
    console.log(`   ${isSet ? '✅' : '❌'} ${varName}: ${isSet ? '***' : 'NOT SET'}`);
    if (!isSet) allConfigured = false;
  }
  
  if (!allConfigured) {
    console.log('\n❌ Some Azure AD credentials are missing!');
    console.log('   Please update your .env file with valid credentials.');
    console.log('   See AZURE_AD_MIGRATION.md for setup instructions.');
    process.exit(1);
  }
  
  console.log('\n✅ All Azure AD credentials are configured\n');
  
  // Test initialization
  console.log('🚀 Attempting to initialize AI service with Azure AD...\n');
  
  try {
    const initialized = await aiService.initialize();
    
    if (initialized) {
      console.log('✅ SUCCESS! Azure AD authentication is working correctly!\n');
      console.log('📊 Authentication Details:');
      console.log(`   Tenant ID: ${process.env.AZURE_TENANT_ID.substring(0, 8)}...`);
      console.log(`   Client ID: ${process.env.AZURE_CLIENT_ID.substring(0, 8)}...`);
      console.log(`   Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`);
      console.log(`   Deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`);
      console.log('\n🎉 Azure AD token obtained successfully!');
      console.log('🎉 Connection test passed!');
      console.log('\n✅ Your Azure AD Service Principal has the correct permissions.');
      console.log('✅ The application is ready to use Azure OpenAI for image analysis.\n');
      process.exit(0);
    } else {
      console.log('❌ FAILED: Azure AD authentication failed');
      console.log('   Check the logs above for specific error messages.');
      console.log('   See AZURE_AD_MIGRATION.md for troubleshooting steps.\n');
      process.exit(1);
    }
  } catch (error) {
    console.log('\n❌ ERROR during Azure AD authentication:\n');
    console.log(`   Error Type: ${error.name}`);
    console.log(`   Error Message: ${error.message}`);
    
    if (error.message.includes('AADSTS')) {
      console.log('\n🔍 Azure AD Error Code detected!');
      console.log('   This is an Azure AD authentication error.');
      
      if (error.message.includes('AADSTS700016')) {
        console.log('   • Cause: Invalid Client ID or Service Principal not found');
        console.log('   • Solution: Verify AZURE_CLIENT_ID in your .env file');
      } else if (error.message.includes('AADSTS7000215')) {
        console.log('   • Cause: Invalid Client Secret or secret expired');
        console.log('   • Solution: Verify AZURE_CLIENT_SECRET in your .env file');
      } else if (error.message.includes('AADSTS50034')) {
        console.log('   • Cause: User or Service Principal not found in tenant');
        console.log('   • Solution: Verify AZURE_TENANT_ID and AZURE_CLIENT_ID');
      } else {
        console.log(`   • Error Code: ${error.message.match(/AADSTS\d+/)?.[0] || 'Unknown'}`);
      }
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n🔍 HTTP 401 Unauthorized Error:');
      console.log('   • The Azure AD token may be invalid');
      console.log('   • Service Principal may lack permissions');
      console.log('   • Required Role: "Cognitive Services User" on Azure OpenAI resource');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.log('\n🔍 HTTP 403 Forbidden Error:');
      console.log('   • Service Principal lacks required permissions');
      console.log('   • Verify "Cognitive Services User" role is assigned');
      console.log('   • Check role assignment scope includes your Azure OpenAI resource');
    }
    
    console.log('\n📚 Troubleshooting Resources:');
    console.log('   • See AZURE_AD_MIGRATION.md for detailed troubleshooting');
    console.log('   • Check Azure AD audit logs in Azure Portal');
    console.log('   • Verify role assignments with: az role assignment list --assignee {client-id}\n');
    
    if (error.stack) {
      console.log('📋 Stack Trace (for debugging):');
      console.log(error.stack);
    }
    
    process.exit(1);
  }
}

// Run the test
testAuthentication().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
