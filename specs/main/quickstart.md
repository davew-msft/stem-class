# Quickstart: Docker & Kubernetes Deployment

**Purpose**: Step-by-step guide to containerize and deploy Rescan application to Kubernetes  
**Time**: 30-45 minutes  
**Prerequisites**: Docker installed, Kubernetes cluster access (kind, minikube, or cloud cluster)

## Overview

This guide teaches you to:
1. Build a Docker container image for the Rescan application
2. Create Kubernetes resources (Deployment, Service, ConfigMap, Secret, PVC)
3. Deploy the application to a Kubernetes cluster
4. Verify the deployment and access the application
5. Scale and update the application

---

## Phase 1: Build Docker Image

### Step 1.1: Create Dockerfile

Create `rescan/Dockerfile`:

```dockerfile
# Educational Note: Multi-stage build reduces final image size
# Stage 1: Build stage with full Node.js and build tools
FROM node:20 AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching optimization)
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production stage with minimal Alpine image
FROM node:20-alpine

# Educational Note: Run as non-root for security
USER node

WORKDIR /app

# Copy production dependencies from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy application code
COPY --chown=node:node . .

# Create data directory for SQLite database
RUN mkdir -p /app/data && mkdir -p /app/backend/public/uploads

# Expose application port
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "backend/src/api/server.js"]
```

### Step 1.2: Create .dockerignore

Create `rescan/.dockerignore`:

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.vscode
.specify
specs/
data/rescan.db
backend/public/uploads/*
*.md
.DS_Store
```

### Step 1.3: Build the Image

```bash
# Navigate to rescan directory
cd /path/to/rescan

# Build Docker image
docker build -t rescan:v1.0.0 -t rescan:latest .

# Educational Note: The build process
# 1. Downloads node:20 base image (if not cached)
# 2. Installs production dependencies
# 3. Copies application code
# 4. Creates final optimized image

# Verify the image
docker images | grep rescan
# Should show rescan:v1.0.0 and rescan:latest (both pointing to same image)

# Check image size
docker images rescan:latest --format "{{.Size}}"
# Should be ~150-200MB (much smaller than full Node.js image)
```

### Step 1.4: Test the Image Locally (Optional)

```bash
# Run container locally
docker run -d \
  --name rescan-test \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=development \
  -e AZURE_OPENAI_API_KEY="your-key-here" \
  -e AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/" \
  -e AZURE_OPENAI_MODEL_DEPLOYMENT="gpt-4o" \
  rescan:latest

# Check logs
docker logs rescan-test

# Test health endpoint
curl http://localhost:3000/health

# Test application
curl http://localhost:3000

# Stop and remove test container
docker stop rescan-test
docker rm rescan-test
```

---

## Phase 2: Setup Kubernetes Cluster

### Option A: Local Development with kind

```bash
# Install kind (if not already installed)
# macOS: brew install kind
# Linux: use installation script from kind.sigs.k8s.io

# Create local Kubernetes cluster
kind create cluster --name rescan-cluster

# Load Docker image into kind cluster
kind load docker-image rescan:latest --name rescan-cluster

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

### Option B: Local Development with minikube

```bash
# Install minikube (if not already installed)
# macOS: brew install minikube
# Linux: see minikube.sigs.k8s.io/docs/start/

# Start minikube cluster
minikube start --driver=docker

# Use minikube's Docker daemon (so it can see your local images)
eval $(minikube docker-env)

# Rebuild image in minikube's Docker
docker build -t rescan:latest .

# Verify cluster
kubectl get nodes
```

### Option C: Cloud Cluster (AWS EKS, Azure AKS, GCP GKE)

```bash
# Push image to container registry
# Example with Docker Hub:
docker tag rescan:latest yourusername/rescan:v1.0.0
docker push yourusername/rescan:v1.0.0

# OR Azure Container Registry:
# az acr login --name yourregistry
# docker tag rescan:latest yourregistry.azurecr.io/rescan:v1.0.0
# docker push yourregistry.azurecr.io/rescan:v1.0.0

# Connect to cloud cluster
# AWS: aws eks update-kubeconfig --name your-cluster
# Azure: az aks get-credentials --resource-group yourRG --name yourAKS
# GCP: gcloud container clusters get-credentials your-cluster

# Verify connection
kubectl get nodes
```

---

## Phase 3: Deploy to Kubernetes

### Step 3.1: Create Namespace

```bash
# Create namespace
kubectl apply -f specs/main/contracts/namespace.yaml

# OR create directly
kubectl create namespace rescan

# Verify
kubectl get namespaces
```

### Step 3.2: Create ConfigMap

```bash
# Apply ConfigMap
kubectl apply -f specs/main/contracts/configmap.yaml

# Verify
kubectl get configmap -n rescan
kubectl describe configmap rescan-config -n rescan
```

### Step 3.3: Create Secret (with YOUR credentials)

**IMPORTANT**: Do NOT commit real secrets to Git!

```bash
# Method 1: Create from command line (RECOMMENDED)
kubectl create secret generic rescan-secrets \
  --from-literal=AZURE_OPENAI_API_KEY='your-actual-api-key' \
  --from-literal=AZURE_OPENAI_ENDPOINT='https://your-resource.openai.azure.com/' \
  --from-literal=AZURE_OPENAI_MODEL_DEPLOYMENT='gpt-4o' \
  --namespace=rescan

# Method 2: Create from file (copy example first)
cp specs/main/contracts/secret.yaml.example secret.yaml
# Edit secret.yaml with real credentials (add to .gitignore!)
kubectl apply -f secret.yaml
rm secret.yaml  # Clean up

# Verify (won't show values)
kubectl get secret -n rescan
kubectl describe secret rescan-secrets -n rescan
```

### Step 3.4: Create Persistent Volume Claim

```bash
# Apply PVC
kubectl apply -f specs/main/contracts/pvc.yaml

# Verify PVC is bound
kubectl get pvc -n rescan

# Educational Note: Watch PVC binding (may take a few seconds)
kubectl get pvc -n rescan -w
# Press Ctrl+C when STATUS shows "Bound"
```

### Step 3.5: Initialize Database

```bash
# Create a temporary pod to initialize the database
kubectl run init-db --image=rescan:latest -n rescan --restart=Never -- \
  sh -c "npm run db:setup"

# Wait for initialization to complete
kubectl wait --for=condition=complete --timeout=60s pod/init-db -n rescan

# Check logs
kubectl logs init-db -n rescan

# Clean up init pod
kubectl delete pod init-db -n rescan
```

### Step 3.6: Deploy Application

```bash
# Apply Deployment
kubectl apply -f specs/main/contracts/deployment.yaml

# Watch deployment rollout
kubectl rollout status deployment/rescan-app -n rescan

# Verify pods are running
kubectl get pods -n rescan
# Should show: rescan-app-xxxxx   1/1   Running   0   xxs

# Check pod logs
kubectl logs -n rescan -l app=rescan --tail=50
```

### Step 3.7: Create Service

```bash
# Apply Service
kubectl apply -f specs/main/contracts/service.yaml

# Verify service
kubectl get service -n rescan

# For LoadBalancer type, wait for EXTERNAL-IP
kubectl get service rescan-service -n rescan -w
# Press Ctrl+C when EXTERNAL-IP shows (may take 1-2 minutes on cloud)
```

---

## Phase 4: Access the Application

### Option A: LoadBalancer (Cloud Clusters)

```bash
# Get external IP
export SERVICE_IP=$(kubectl get svc rescan-service -n rescan -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Access application
curl http://$SERVICE_IP:3000/health

# Open in browser
open http://$SERVICE_IP:3000  # macOS
# OR visit http://<EXTERNAL-IP>:3000 in browser
```

### Option B: ClusterIP with Port Forward (Local Development)

```bash
# Forward local port 3000 to service
kubectl port-forward -n rescan svc/rescan-service 3000:3000

# Leave this terminal open, open new terminal
curl http://localhost:3000/health

# Open in browser
open http://localhost:3000
```

### Option C: NodePort (kind/minikube)

If you changed Service type to NodePort:

```bash
# kind: Get node port
export NODE_PORT=$(kubectl get svc rescan-service -n rescan -o jsonpath='{.spec.ports[0].nodePort}')

# kind: Access via localhost
curl http://localhost:$NODE_PORT/health

# minikube: Get URL
minikube service rescan-service -n rescan --url
```

---

## Phase 5: Verify Deployment

### Check Health Endpoints

```bash
# Health check (liveness)
curl http://<YOUR-IP>:3000/health
# Expected: {"status":"ok"}

# Readiness check
curl http://<YOUR-IP>:3000/ready
# Expected: {"status":"ready"} (if DB connected)

# Homepage
curl http://<YOUR-IP>:3000/
# Expected: HTML content
```

### Check Application Logs

```bash
# Tail logs
kubectl logs -n rescan -l app=rescan --tail=100 -f

# Check specific pod
kubectl get pods -n rescan
kubectl logs -n rescan rescan-app-xxxxx

# Previous pod logs (if pod restarted)
kubectl logs -n rescan rescan-app-xxxxx --previous
```

### Inspect Resources

```bash
# View all resources
kubectl get all -n rescan

# Describe deployment
kubectl describe deployment rescan-app -n rescan

# Describe pods
kubectl describe pod -n rescan -l app=rescan

# Check events
kubectl get events -n rescan --sort-by='.lastTimestamp'
```

---

## Phase 6: Common Operations

### Scaling the Application

```bash
# NOTE: For SQLite, keep replicas=1
# For future PostgreSQL migration:

# Scale to 3 replicas
kubectl scale deployment rescan-app -n rescan --replicas=3

# Verify scaling
kubectl get pods -n rescan -w
```

### Updating the Application

```bash
# Method 1: Update image tag in deployment.yaml
# Edit contracts/deployment.yaml: change image to rescan:v1.0.1
kubectl apply -f specs/main/contracts/deployment.yaml

# Method 2: Update image via kubectl
kubectl set image deployment/rescan-app rescan=rescan:v1.0.1 -n rescan

# Watch rolling update
kubectl rollout status deployment/rescan-app -n rescan

# Check rollout history
kubectl rollout history deployment/rescan-app -n rescan
```

### Rolling Back a Deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/rescan-app -n rescan

# Rollback to specific revision
kubectl rollout undo deployment/rescan-app -n rescan --to-revision=2
```

### Updating Configuration

```bash
# Edit ConfigMap
kubectl edit configmap rescan-config -n rescan
# OR update configmap.yaml and apply

# Restart pods to pick up new config
kubectl rollout restart deployment/rescan-app -n rescan
```

### Backup Database

```bash
# Copy database from pod to local machine
kubectl exec -n rescan $(kubectl get pod -n rescan -l app=rescan -o jsonpath='{.items[0].metadata.name}') -- \
  cat /app/data/rescan.db > rescan-backup-$(date +%Y%m%d).db

# Verify backup
ls -lh rescan-backup-*.db
```

---

## Phase 7: Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n rescan
kubectl describe pod <pod-name> -n rescan

# Common issues:
# - ImagePullBackOff: Image not found in registry
# - CrashLoopBackOff: Application crashing on startup
# - Pending: Insufficient resources or PVC not bound

# Check logs
kubectl logs <pod-name> -n rescan
```

### Service Not Accessible

```bash
# Verify service endpoints
kubectl get endpoints rescan-service -n rescan
# Should show pod IP addresses

# Check if pods are ready
kubectl get pods -n rescan
# STATUS should be Running, READY should be 1/1

# Test from within cluster
kubectl run test --image=curlimages/curl -n rescan --rm -it -- \
  curl http://rescan-service:3000/health
```

### Database Issues

```bash
# Check PVC binding
kubectl get pvc -n rescan
# STATUS should be "Bound"

# Check if database file exists
kubectl exec -n rescan $(kubectl get pod -n rescan -l app=rescan -o jsonpath='{.items[0].metadata.name}') -- \
  ls -la /app/data/

# Reinitialize database (WARNING: deletes existing data)
kubectl exec -n rescan $(kubectl get pod -n rescan -l app=rescan -o jsonpath='{.items[0].metadata.name}') -- \
  npm run db:setup
```

### Resource Constraints

```bash
# Check resource usage
kubectl top pods -n rescan
kubectl top nodes

# Describe pod to see resource limits
kubectl describe pod <pod-name> -n rescan

# If OOMKilled: increase memory limits in deployment.yaml
```

---

## Phase 8: Cleanup

### Delete Application (Keep Cluster)

```bash
# Delete all resources in namespace
kubectl delete namespace rescan

# OR delete resources individually
kubectl delete deployment rescan-app -n rescan
kubectl delete service rescan-service -n rescan
kubectl delete configmap rescan-config -n rescan
kubectl delete secret rescan-secrets -n rescan
kubectl delete pvc rescan-data-pvc -n rescan
```

### Delete Local Cluster

```bash
# kind
kind delete cluster --name rescan-cluster

# minikube
minikube delete
```

---

## Educational Learning Objectives Checklist

After completing this quickstart, students should understand:

- [ ] Multi-stage Docker builds for optimization
- [ ] Container security (non-root user, minimal images)
- [ ] Kubernetes resource types (Deployment, Service, ConfigMap, Secret, PVC)
- [ ] Pod lifecycle and health checks
- [ ] Configuration management (separation of code and config)
- [ ] Persistent storage in Kubernetes
- [ ] Service discovery and networking
- [ ] Rolling updates and rollbacks
- [ ] Resource limits and requests
- [ ] Troubleshooting containerized applications

---

## Next Steps

1. **Add Ingress**: Configure HTTP/HTTPS routing with domain names
2. **Monitoring**: Add Prometheus metrics and Grafana dashboards
3. **Horizontal Pod Autoscaling**: Auto-scale based on CPU/memory
4. **CI/CD Pipeline**: Automate builds and deployments
5. **Migrate to PostgreSQL**: Enable true horizontal scaling

---

**Last Updated**: 2026-02-22  
**Tested With**: Kubernetes 1.25+, Docker 20.10+, kind 0.20+
