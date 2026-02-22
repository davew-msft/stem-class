# Research: Docker & Kubernetes Deployment for Rescan

**Date**: 2026-02-22  
**Feature**: Container deployment and orchestration  
**Purpose**: Research best practices for containerizing Node.js applications and deploying to Kubernetes

## Executive Summary

Researched Docker containerization and Kubernetes deployment strategies for the Rescan educational application. Key findings:
- Multi-stage builds reduce image size by 60-70%
- Alpine Linux base images provide security and minimal footprint
- Health checks essential for K8s orchestration reliability
- Persistent volumes required for SQLite database state
- ConfigMaps/Secrets separate configuration from code

## Research Questions & Findings

### 1. Docker Image Optimization for Node.js Applications

**Question**: How to create minimal, secure Docker images for Node.js apps?

**Decision**: Multi-stage Dockerfile with Alpine base image

**Rationale**:
- **Stage 1 (Build)**: Use full `node:20` image with build tools for `npm install`
- **Stage 2 (Production)**: Use `node:20-alpine` with only production dependencies
- Results in images ~100-150MB vs 900MB+ for full Node.js image
- Alpine removes unnecessary OS utilities, reducing attack surface
- Separate dev dependencies from production reduces final image size

**Alternatives Considered**:
- **Option 1**: Single-stage build - Rejected: includes dev dependencies and build tools (larger image)
- **Option 2**: Distroless images - Rejected: more complex for educational context, harder to debug
- **Option 3**: Scratch images - Rejected: requires static binaries, not suitable for Node.js

**Implementation**:
```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
CMD ["node", "backend/src/api/server.js"]
```

---

### 2. Kubernetes State Management for SQLite

**Question**: How to handle SQLite database persistence in Kubernetes?

**Decision**: Use PersistentVolumeClaim (PVC) with ReadWriteOnce access mode

**Rationale**:
- SQLite requires file system access with read/write capability
- PVC ensures database survives pod restarts and failures
- ReadWriteOnce sufficient since SQLite doesn't support concurrent writes from multiple pods
- For educational purposes, simple local-path or hostPath provisioner works well
- Production scaling would require migration to PostgreSQL/MySQL for multi-pod writes

**Alternatives Considered**:
- **Option 1**: EmptyDir volume - Rejected: data lost on pod restart (fails FR-002)
- **Option 2**: ConfigMap - Rejected: not suitable for binary files or mutable data
- **Option 3**: External database (PostgreSQL) - Rejected: adds complexity beyond educational scope
- **Option 4**: S3/Cloud storage - Rejected: SQLite not designed for remote filesystems

**Implementation**:
- Single PVC for database file: `rescan-data-pvc`
- Mount at `/app/data` in container
- Keep replicas=1 in Deployment (SQLite limitation)
- Include backup strategy in documentation

**Note for Education**: This teaches persistence concepts and SQLite limitations. Students learn that stateful applications have different requirements than stateless services.

---

### 3. Configuration Management (Environment Variables)

**Question**: How to manage sensitive credentials (Azure OpenAI API keys) in Kubernetes?

**Decision**: Use Kubernetes Secrets for sensitive data, ConfigMaps for non-sensitive config

**Rationale**:
- Secrets provide base64 encoding and RBAC protection
- Separates secrets from application code (FR-024, FR-025)
- ConfigMaps allow environment-specific configuration without rebuilding images
- Follows 12-factor app principles taught in STEM curriculum
- Easy to update configuration without redeploying application

**Alternatives Considered**:
- **Option 1**: Hardcode in Dockerfile - Rejected: exposes secrets in image layers
- **Option 2**: External secret management (Vault, Azure Key Vault) - Rejected: too complex for educational setting
- **Option 3**: .env files in image - Rejected: secrets baked into image, not environment-specific

**Implementation**:
```yaml
# ConfigMap for non-sensitive config
apiVersion: v1
kind: ConfigMap
metadata:
  name: rescan-config
data:
  PORT: "3000"
  NODE_ENV: "production"
  EDUCATIONAL_MODE: "true"

# Secret for sensitive credentials
apiVersion: v1
kind: Secret
metadata:
  name: rescan-secrets
type: Opaque
stringData:
  AZURE_OPENAI_API_KEY: "<your-key-here>"
  AZURE_OPENAI_ENDPOINT: "https://your-resource.openai.azure.com/"
```

---

### 4. Container Security Best Practices

**Question**: How to run containers securely in educational environment?

**Decision**: Non-root user, read-only root filesystem where possible, security context

**Rationale**:
- Running as non-root prevents privilege escalation (FR-035)
- Alpine `node` user (uid 1000) available by default
- If container compromised, attacker has limited permissions
- Teaches security principles early in students' development learning

**Alternatives Considered**:
- **Option 1**: Run as root - Rejected: security vulnerability, bad practice to teach
- **Option 2**: Custom user creation - Rejected: unnecessary, Alpine node image includes `node` user

**Implementation**:
```dockerfile
USER node
```
```yaml
# In Kubernetes SecurityContext
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  allowPrivilegeEscalation: false
```

---

### 5. Health Checks for Kubernetes Orchestration

**Question**: How should Kubernetes determine if application is healthy?

**Decision**: Implement `/health` and `/ready` endpoints, configure liveness and readiness probes

**Rationale**:
- Liveness probe restarts pod if application crashes
- Readiness probe prevents traffic to pod until dependencies ready (database connected)
- K8s uses these to manage rolling updates and scaling
- Educational value: teaches students about production monitoring

**Alternatives Considered**:
- **Option 1**: No health checks - Rejected: K8s can't detect failures, teaches bad practices
- **Option 2**: TCP socket probe only - Rejected: doesn't verify application logic, only port open

**Implementation**:
```javascript
// In Express app
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  // Check database connection
  const dbOk = await checkDatabaseConnection();
  if (dbOk) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});
```

```yaml
# In Deployment
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```

---

### 6. Resource Limits and Requests

**Question**: How much CPU/memory should we allocate to pods?

**Decision**: 
- Requests: 100m CPU, 128Mi memory (guaranteed minimum)
- Limits: 200m CPU, 200Mi memory (maximum allowed)

**Rationale**:
- Based on observed resource usage during development (~80Mi memory, <100m CPU)
- Allows overhead for image processing (AI calls)
- Prevents single pod from consuming all cluster resources
- Teaches resource management concepts
- Small limits keep classroom cluster costs low

**Alternatives Considered**:
- **Option 1**: No limits - Rejected: pod could exhaust node resources
- **Option 2**: Higher limits (1 CPU, 1Gi) - Rejected: wasteful for educational app
- **Option 3**: Burstable QoS (limits >> requests) - Considered viable alternative

**Implementation**:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "200Mi"
    cpu: "200m"
```

---

## Technology Stack Decisions

### Selected Technologies

| Component | Choice | Version | Justification |
|-----------|--------|---------|---------------|
| Base Image | node:20-alpine | 20.x LTS | Minimal size, long-term support, security updates |
| Container Runtime | Docker | 20.10+ | Industry standard, student familiarity, wide documentation |
| Orchestration | Kubernetes | 1.25+ | Cloud-native standard, learning objective, scalability |
| Storage | PersistentVolume | N/A | State persistence, pod restart resilience |
| Secrets Management | K8s Secrets | N/A | Built-in, simple for education, no external dependencies |

### Educational Considerations

**Why these choices support learning**:
1. **Docker**: Standard industry tool, transferable skills, clear documentation
2. **Multi-stage builds**: Teaches optimization, security, and build processes
3. **Alpine Linux**: Demonstrates minimal dependencies and security hardening
4. **Kubernetes**: Core cloud-native skill, high demand in industry
5. **ConfigMaps/Secrets**: 12-factor app compliance, separation of concerns
6. **Health checks**: Production readiness, monitoring concepts

---

## Implementation Considerations

### File Upload Persistence
- Upload directory (`backend/public/uploads/`) needs PVC or should be ephemeral
- Decision: Treat as ephemeral cache - uploaded images processed immediately then deleted
- No PVC needed for uploads (reduces complexity)
- If persistence needed: add second PVC

### Database Initialization
- `npm run db:setup` must run on first deployment
- Solution: Init container or manual kubectl exec
- Include in quickstart documentation

### Port Configuration
- Application listens on PORT environment variable
- Default: 3000
- Kubernetes Service exposes this port
- Use ClusterIP + Ingress for educational cluster
- Or LoadBalancer for cloud deployments

### Image Registry
- For local development: build locally, kind load docker-image
- For production: push to Docker Hub, GitHub Container Registry, or Azure ACR
- Include registry setup in quickstart

---

## Open Questions / Future Research

1. **Production Database**: When to migrate from SQLite to PostgreSQL for multi-pod scaling?
2. **Image Registry**: Should students use Docker Hub or set up private registry?
3. **Ingress**: Which Ingress controller (Nginx, Traefik) for classroom environment?
4. **Monitoring**: Add Prometheus metrics for advanced students?

These questions can be addressed in future iterations as students progress.

---

## References

- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Kubernetes Documentation - Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [12-Factor App Methodology](https://12factor.net/)
- [Alpine Linux Security](https://alpinelinux.org/about/)
- [SQLite in Production](https://www.sqlite.org/whentouse.html)

---

**Research Complete**: 2026-02-22  
**Next Phase**: Design (data-model.md, contracts/, quickstart.md)
