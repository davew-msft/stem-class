# Azure AD Authentication Migration

## Overview

The Rescan application has been updated to use **Azure AD (Entra ID) Service Principal authentication** instead of API key authentication for Azure OpenAI access. This change is required when API key-based authentication is disabled on your Azure OpenAI resource.

## What Changed

### 1. **Authentication Method**
- **Before**: Simple API key authentication with `api-key` header
- **After**: Azure AD OAuth 2.0 client credentials flow with Bearer token

### 2. **Required Environment Variables**

#### Old Configuration (.env)
```bash
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```

#### New Configuration (.env)
```bash
# Azure AD (Entra ID) Service Principal Authentication
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```

### 3. **Code Changes**

#### backend/src/services/aiService.js
The `initialize()` method now:
1. Creates a `ClientSecretCredential` from `@azure/identity`
2. Obtains an Azure AD token with the `https://cognitiveservices.azure.com/.default` scope
3. Uses the token as a Bearer token in the `Authorization` header

**Key Code**:
```javascript
const { ClientSecretCredential } = require('@azure/identity');
const { OpenAI } = require('openai');

async initialize() {
  // Obtain Azure AD token using Service Principal credentials
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );
  
  const tokenResponse = await credential.getToken(
    'https://cognitiveservices.azure.com/.default'
  );

  // Initialize OpenAI client with Bearer token
  this.client = new OpenAI({
    apiKey: tokenResponse.token,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
    defaultHeaders: {
      'Authorization': `Bearer ${tokenResponse.token}`,
    },
    defaultQuery: { 'api-version': '2024-02-15-preview' }
  });
}
```

### 4. **Dependencies**
Added `@azure/identity` package for Azure AD authentication:
```bash
npm install @azure/identity --save
```

### 5. **Configuration Files Updated**
- `.env.example` - Updated with Azure AD variables and setup instructions
- `k8s/secret.yaml.example` - Updated Kubernetes secret template
- `README.md` - Updated prerequisites and troubleshooting sections

## Azure AD Setup (For Instructors)

### Prerequisites
- Azure subscription with Azure OpenAI resource
- Permissions to create Service Principals in Azure AD

### Step 1: Create Service Principal

```bash
# Create a Service Principal for the application
az ad sp create-for-rbac --name "RescanAppServicePrincipal" --role Contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}

# Output will include:
# {
#   "appId": "your-client-id",           # This is AZURE_CLIENT_ID
#   "displayName": "RescanAppServicePrincipal",
#   "password": "your-client-secret",     # This is AZURE_CLIENT_SECRET
#   "tenant": "your-tenant-id"            # This is AZURE_TENANT_ID
# }
```

### Step 2: Assign Cognitive Services Role

The Service Principal needs **"Cognitive Services User"** role on the Azure OpenAI resource:

```bash
# Get your Azure OpenAI resource ID
az cognitiveservices account show \
  --name brian-stem-resource \
  --resource-group rg-admin-4393 \
  --query id -o tsv

az cognitiveservices account deployment list \
  --name brian-stem-resource \
  --resource-group rg-admin-4393 \
  --query "[].name" -o tsv

# Assign "Cognitive Services User" role to the Service Principal
az role assignment create \
  --assignee {client-id-from-step-1} \
  --role "Cognitive Services User" \
  --scope {resource-id-from-above}
```

### Step 3: Test Authentication

1. Update `.env` file with the Service Principal credentials:
```bash
cp .env.example .env
# Edit .env and fill in AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
```

2. Start the application:
```bash
npm run dev
```

3. Upload a recycling symbol image via the web UI
4. Verify the AI analysis returns material identification

## Token Management

### Token Lifecycle
- Azure AD tokens expire after **1 hour**
- Current implementation obtains a new token on each `initialize()` call
- For long-running processes, consider implementing token caching and refresh logic

### Token Refresh (Future Enhancement)
If needed, you can implement token caching:

```javascript
class AIService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken() {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    // Obtain new token
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID,
      process.env.AZURE_CLIENT_ID,
      process.env.AZURE_CLIENT_SECRET
    );
    
    const tokenResponse = await credential.getToken(
      'https://cognitiveservices.azure.com/.default'
    );

    // Cache token and expiry
    this.token = tokenResponse.token;
    this.tokenExpiry = tokenResponse.expiresOnTimestamp;
    
    return this.token;
  }
}
```

## Troubleshooting

### Error: "401 Unauthorized"
**Cause**: Invalid Service Principal credentials or token expired

**Solutions**:
1. Verify `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` are correct
2. Check that the Service Principal hasn't been deleted or disabled
3. Ensure the Service Principal password hasn't expired (default: 1 year)

### Error: "403 Forbidden"
**Cause**: Service Principal lacks required permissions

**Solutions**:
1. Verify "Cognitive Services User" role is assigned to the Service Principal
2. Check the role assignment scope includes your Azure OpenAI resource
3. Wait a few minutes for role assignment propagation (can take 5-10 minutes)

### Error: "AADSTS700016: Application not found"
**Cause**: Invalid `AZURE_CLIENT_ID` or Service Principal deleted

**Solutions**:
1. Verify the Client ID is correct in `.env`
2. Check the Service Principal still exists: `az ad sp show --id {client-id}`
3. If deleted, recreate the Service Principal (see Setup Step 1)

### Error: "AADSTS7000215: Invalid client secret"
**Cause**: Invalid `AZURE_CLIENT_SECRET` or secret expired

**Solutions**:
1. Verify the Client Secret is correct in `.env` (no extra spaces or quotes)
2. Check if the secret has expired: `az ad app credential list --id {client-id}`
3. If expired, create a new secret: `az ad app credential reset --id {client-id}`

## Kubernetes Deployment

The Kubernetes secret template has been updated for Azure AD authentication:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: rescan-secrets
  namespace: rescan
type: Opaque
stringData:
  # Azure AD Service Principal Authentication
  AZURE_TENANT_ID: "your-tenant-id"
  AZURE_CLIENT_ID: "your-client-id"
  AZURE_CLIENT_SECRET: "your-client-secret"
  
  # Azure OpenAI Configuration
  AZURE_OPENAI_ENDPOINT: "https://your-resource.openai.azure.com/"
  AZURE_OPENAI_DEPLOYMENT_NAME: "gpt-4o"
```

Create the secret using kubectl:
```bash
kubectl create secret generic rescan-secrets \
  --from-literal=AZURE_TENANT_ID='your-tenant-id' \
  --from-literal=AZURE_CLIENT_ID='your-client-id' \
  --from-literal=AZURE_CLIENT_SECRET='your-client-secret' \
  --from-literal=AZURE_OPENAI_ENDPOINT='https://your-resource.openai.azure.com/' \
  --from-literal=AZURE_OPENAI_DEPLOYMENT_NAME='gpt-4o' \
  --namespace=rescan
```

## Security Best Practices

### Development Environment
- ✅ Store credentials in `.env` file (never commit to Git)
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use `.env.example` as a template (committed to Git)
- ✅ Rotate Service Principal secrets regularly (every 90 days recommended)

### Production Environment
- ✅ Use Kubernetes Secrets or Azure Key Vault for credential storage
- ✅ Enable Managed Identity for Azure resources (if running on Azure)
- ✅ Implement least-privilege access (only "Cognitive Services User" role)
- ✅ Monitor Service Principal usage with Azure AD audit logs
- ✅ Set up alerts for authentication failures

### Educational Context
For classroom use:
- Instructor creates one Service Principal per class or project
- Share credentials securely (never via email or chat - use password managers)
- Revoke credentials at end of semester
- Consider using separate Azure subscriptions for educational vs production

## Benefits of Azure AD Authentication

1. **Security**: Centralized credential management, role-based access control
2. **Compliance**: Meets enterprise and government security requirements
3. **Auditing**: All API calls are logged with Service Principal identity
4. **Rotation**: Easily rotate credentials without changing API keys
5. **Scope Control**: Fine-grained permissions via Azure RBAC

## Migration Checklist

- [x] Installed `@azure/identity` package
- [x] Updated `aiService.js` to use ClientSecretCredential
- [x] Updated `.env.example` with Azure AD variables
- [x] Updated `k8s/secret.yaml.example` for Azure AD
- [x] Updated README.md with Azure AD setup instructions
- [ ] Created Azure AD Service Principal (instructor task)
- [ ] Assigned "Cognitive Services User" role (instructor task)
- [ ] Updated local `.env` file with real credentials
- [ ] Tested authentication with `npm run dev`
- [ ] Verified image upload and AI analysis works
- [ ] (Optional) Deployed to Kubernetes cluster

## Questions or Issues?

If you encounter problems:
1. Check the troubleshooting section above
2. Review Azure AD audit logs in Azure Portal
3. Verify role assignments with `az role assignment list --assignee {client-id}`
4. Ask your instructor for assistance with Azure AD setup

---

**Documentation Created**: Migration from API key to Azure AD authentication
**Last Updated**: Current session
