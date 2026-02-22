# Data Model: Kubernetes Deployment Architecture

**Date**: 2026-02-22  
**Feature**: Container deployment and orchestration  
**Purpose**: Define the deployment architecture and resource relationships for Kubernetes

## Overview

This document describes the Kubernetes resource model and relationships for the Rescan application deployment. Unlike traditional data models (database schemas), this focuses on the cloud-native resource architecture.

## Kubernetes Resource Model

### Deployment Hierarchy

```
Namespace: rescan
  ├── Deployment: rescan-app
  │   └── ReplicaSet (managed automatically)
  │       └── Pods: rescan-app-xxxxx (1-3 replicas)
  │           ├── Container: rescan
  │           │   ├── Mounts: /app/data (from PVC)
  │           │   ├── Env: (from ConfigMap + Secret)
  │           │   └── Ports: 3000
  │           └── Health Probes: /health, /ready
  │
  ├── Service: rescan-service
  │   ├── Type: ClusterIP (or LoadBalancer)
  │   ├── Selector: app=rescan
  │   └── Port: 3000 → targetPort: 3000
  │
  ├── ConfigMap: rescan-config
  │   ├── PORT: 3000
  │   ├── NODE_ENV: production
  │   ├── EDUCATIONAL_MODE: true
  │   └── DATABASE_URL: sqlite:./data/rescan.db
  │
  ├── Secret: rescan-secrets
  │   ├── AZURE_OPENAI_API_KEY: (base64)
  │   ├── AZURE_OPENAI_ENDPOINT: (base64)
  │   └── AZURE_OPENAI_MODEL_DEPLOYMENT: (base64)
  │
  └── PersistentVolumeClaim: rescan-data
      ├── Access Mode: ReadWriteOnce
      ├── Storage: 1Gi
      └── Mounted at: /app/data in pods
```

## Resource Definitions

### 1. Namespace

**Purpose**: Logical isolation for Rescan application resources

**Attributes**:
- Name: `rescan` or `rescan-dev`, `rescan-prod`
- Labels: `app=rescan`, `environment=<env>`

**Relationships**: Contains all other resources

---

### 2. Deployment

**Purpose**: Manages application pods with desired state and rolling updates

**Attributes**:
- **Name**: `rescan-app`
- **Replicas**: 1 (SQLite limitation) or 2-3 (if using external DB future)
- **Selector**: `app: rescan`
- **Strategy**: RollingUpdate (maxSurge: 1, maxUnavailable: 0)
- **Revision History**: 10 revisions kept

**Pod Template**:
- **Labels**: `app: rescan`, `version: v1.0.0`
- **Containers**: 
  - Name: `rescan`
  - Image: `rescan:latest` or `<registry>/rescan:<tag>`
  - ImagePullPolicy: `IfNotPresent` (dev) / `Always` (prod)
  - Ports: `containerPort: 3000`
  - Resources:
    - Requests: 100m CPU, 128Mi memory
    - Limits: 200m CPU, 200Mi memory

**Relationships**:
- Creates/manages ReplicaSets
- ReplicaSets create/manage Pods
- Pods mount volumes from PVC
- Pods consume ConfigMap and Secret

**State Transitions**:
```
Deployment Created → ReplicaSet Created → Pods Pending → Pods Running → Pods Ready
                                                    ↓
                                           (if unhealthy)
                                                    ↓
                                           Pod Restarted (liveness probe)
```

---

### 3. Service

**Purpose**: Provides stable network endpoint for accessing application pods

**Attributes**:
- **Name**: `rescan-service`
- **Type**: `ClusterIP` (internal) or `LoadBalancer` (external)
- **Selector**: `app: rescan`
- **Ports**:
  - Port: `3000` (service port)
  - TargetPort: `3000` (container port)
  - Protocol: TCP

**Relationships**:
- Selects pods with label `app: rescan`
- Routes traffic to healthy pods (readiness probe)
- Creates Endpoints object automatically

**DNS Resolution**:
- Within namespace: `rescan-service`
- Across cluster: `rescan-service.rescan.svc.cluster.local`

---

### 4. ConfigMap

**Purpose**: Store non-sensitive configuration as key-value pairs

**Attributes**:
- **Name**: `rescan-config`
- **Data** (key-value pairs):
  ```
  PORT: "3000"
  NODE_ENV: "production"
  EDUCATIONAL_MODE: "true"
  DATABASE_URL: "sqlite:./data/rescan.db"
  MAX_FILE_SIZE: "5242880"
  MAX_CONCURRENT_REQUESTS: "5"
  ```

**Relationships**:
- Consumed by Deployment as environment variables
- Can be updated independently of Deployment (requires pod restart)

**Update Strategy**:
- Immutable: No (can be edited)
- Update triggers: Manual pod restart or Deployment rollout

---

### 5. Secret

**Purpose**: Store sensitive credentials with base64 encoding and RBAC protection

**Attributes**:
- **Name**: `rescan-secrets`
- **Type**: Opaque
- **StringData** (auto-encoded to base64):
  ```
  AZURE_OPENAI_API_KEY: "<your-key-here>"
  AZURE_OPENAI_ENDPOINT: "https://your-resource.openai.azure.com/"
  AZURE_OPENAI_MODEL_DEPLOYMENT: "gpt-4o"
  ```

**Relationships**:
- Consumed by Deployment as environment variables
- Never logged or exposed in pod spec output
- Access controlled by RBAC

**Security Considerations**:
- Not committed to version control (use `.example` template)
- Base64 is encoding, NOT encryption
- For production: consider external secret management (e.g., Azure Key Vault)

---

### 6. PersistentVolumeClaim (PVC)

**Purpose**: Request persistent storage for SQLite database

**Attributes**:
- **Name**: `rescan-data-pvc`
- **Access Mode**: ReadWriteOnce (single node read/write)
- **Storage**: 1Gi
- **Storage Class**: Default (or `local-path`, `hostPath` for local clusters)

**Relationships**:
- Bound to PersistentVolume (PV) by K8s
- Mounted into pods at `/app/data`
- Survives pod deletion and restart
- Shared across pod replicas (but SQLite only allows one writer)

**Volume Binding**:
```
PVC Created → K8s finds/creates PV → Bound → Pod mounts volume
```

**Data Lifecycle**:
- **Pod restart**: Data persists (mounted from same PVC)
- **Deployment update**: Data persists (PVC independent of Deployment)
- **PVC deletion**: Data lost (PV may be deleted based on reclaim policy)

---

## Container Configuration

### Environment Variables (Injected into Pod)

| Variable | Source | Type | Example Value |
|----------|--------|------|---------------|
| PORT | ConfigMap | Non-sensitive | 3000 |
| NODE_ENV | ConfigMap | Non-sensitive | production |
| EDUCATIONAL_MODE | ConfigMap | Non-sensitive | true |
| DATABASE_URL | ConfigMap | Non-sensitive | sqlite:./data/rescan.db |
| AZURE_OPENAI_API_KEY | Secret | Sensitive | sk-proj-xxxxx |
| AZURE_OPENAI_ENDPOINT | Secret | Sensitive | https://xxx.openai.azure.com/ |
| AZURE_OPENAI_MODEL_DEPLOYMENT | Secret | Sensitive | gpt-4o |

### Volume Mounts

| Mount Path | Source | Purpose |
|------------|--------|---------|
| /app/data | PVC: rescan-data-pvc | SQLite database persistence |
| /app/backend/public/uploads | (ephemeral) | Temporary image uploads (cleared on restart) |

### Health Check Endpoints

| Endpoint | Type | Purpose | Success Criteria |
|----------|------|---------|------------------|
| GET /health | Liveness Probe | Detect if app is alive | HTTP 200 OK |
| GET /ready | Readiness Probe | Detect if app can serve traffic | HTTP 200 OK (DB connected) |

---

## Resource Relationships Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ Kubernetes Namespace: rescan                                 │
│                                                               │
│  ┌────────────────┐         ┌────────────────┐              │
│  │  ConfigMap     │────────▶│   Deployment   │              │
│  │  rescan-config │         │   rescan-app   │              │
│  └────────────────┘         └────────┬───────┘              │
│                                       │                       │
│  ┌────────────────┐                  │ creates               │
│  │   Secret       │────────▶         │                       │
│  │ rescan-secrets │                  ▼                       │
│  └────────────────┘         ┌────────────────┐              │
│                              │   ReplicaSet   │              │
│  ┌────────────────┐          └────────┬───────┘              │
│  │      PVC       │                   │ manages              │
│  │ rescan-data-pvc│                   ▼                       │
│  └────────┬───────┘          ┌────────────────┐              │
│           │ mounts           │   Pod (1-3x)   │              │
│           └─────────────────▶│  rescan-app-xxx│              │
│                              └────────┬───────┘              │
│                                       │                       │
│  ┌────────────────┐                  │ selected by           │
│  │    Service     │◀─────────────────┘                       │
│  │ rescan-service │                                           │
│  └────────────────┘                                           │
│         │                                                     │
└─────────┼─────────────────────────────────────────────────────┘
          │ exposes
          ▼
     External Users
       (port 3000)
```

---

## Deployment Constraints

### SQLite Limitations
- **Single Writer**: Only one pod can write to SQLite database at a time
- **Access Mode**: PVC must be ReadWriteOnce (RWO)
- **Replica Count**: 1 pod OR read-only replicas for future
- **Scaling**: Horizontal scaling requires migration to client-server DB (PostgreSQL, MySQL)

### Storage Considerations
- **Backup**: Manual backup of PVC data or Velero for cluster backups
- **Size**: 1Gi sufficient for educational use (~1000s of scan sessions)
- **Performance**: Local SSD storage preferred for SQLite performance

### Network Access
- **ClusterIP**: Internal access only (for dev/test with kubectl port-forward)
- **LoadBalancer**: External access (cloud providers assign external IP)
- **Ingress**: HTTP/HTTPS routing with domain names (requires Ingress controller)

---

## Validation Rules

### Deployment
- Must have at least 1 replica
- Resources requests must be ≤ limits
- Container port must match Service targetPort
- Health check paths must return 200 OK when healthy

### ConfigMap & Secret
- All required environment variables must be present
- Azure OpenAI endpoint must include `/openai/` path
- PORT must be valid integer (1024-65535)

### PVC
- Storage must be at least 500Mi (minimum for SQLite + data)
- Access mode must be ReadWriteOnce
- Storage class must support the access mode

---

## Future Enhancements

1. **Multi-Pod Scaling**: Migrate to PostgreSQL for horizontal scaling
2. **StatefulSet**: Use instead of Deployment for stable pod identity
3. **Backup CronJob**: Automated database backups to S3/Cloud Storage
4. **Monitoring**: Add Prometheus metrics and Grafana dashboards
5. **Ingress**: Add HTTPS termination and domain routing

---

**Model Complete**: 2026-02-22  
**Next**: Generate Kubernetes manifest contracts
