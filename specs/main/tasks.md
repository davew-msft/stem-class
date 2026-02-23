# Tasks: Rescan - Docker & Kubernetes Deployment

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Current Status**: User Stories 1-3 (P1-P3) are already implemented. This task list focuses on User Story 4 (P4) - Container Deployment.

**Organization**: Tasks are grouped by implementation phase to enable systematic deployment of containerization and Kubernetes orchestration.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US4 = Container Deployment)
- File paths are relative to `rescan/` directory

---

## Phase 1: Health Check Infrastructure

**Purpose**: Add Kubernetes-compatible health check endpoints required for container orchestration

**Goal**: Implement liveness and readiness probes that Kubernetes uses to manage pod lifecycle

- [ ] T001 [US4] Add `/ready` readiness probe endpoint in backend/src/app.js
- [ ] T002 [US4] Update `/health` endpoint to include database connectivity check in backend/src/app.js
- [ ] T003 [US4] Test health endpoints locally (curl http://localhost:3000/health and /ready)

**Checkpoint**: Health endpoints return 200 OK and JSON status

---

## Phase 2: Docker Containerization

**Purpose**: Create Docker configuration for building optimized container images

**Goal**: Build production-ready Docker image that runs the Rescan application

### Docker Configuration Files

- [ ] T004 [P] [US4] Create Dockerfile with multi-stage build in rescan/Dockerfile
- [ ] T005 [P] [US4] Create .dockerignore file to exclude unnecessary files in rescan/.dockerignore
- [ ] T006 [P] [US4] Update .gitignore to exclude Docker-related temp files

### Docker Build & Testing

- [ ] T007 [US4] Build Docker image locally: `docker build -t rescan:v1.0.0 .`
- [ ] T008 [US4] Test Docker image locally with environment variables
- [ ] T009 [US4] Verify image size is <200MB compressed
- [ ] T010 [US4] Test health endpoints in running container

**Checkpoint**: Docker container runs application successfully, health checks pass

---

## Phase 3: Kubernetes Manifest Creation

**Purpose**: Create Kubernetes resource definitions for deploying the application

**Goal**: Generate all required K8s manifests for production deployment

### Core Kubernetes Resources

- [ ] T011 [P] [US4] Create k8s/ directory in rescan/k8s/
- [ ] T012 [P] [US4] Copy namespace.yaml from specs/main/contracts/ to rescan/k8s/namespace.yaml
- [ ] T013 [P] [US4] Copy configmap.yaml from specs/main/contracts/ to rescan/k8s/configmap.yaml
- [ ] T014 [P] [US4] Copy secret.yaml.example from specs/main/contracts/ to rescan/k8s/secret.yaml.example
- [ ] T015 [P] [US4] Copy pvc.yaml from specs/main/contracts/ to rescan/k8s/pvc.yaml
- [ ] T016 [P] [US4] Copy service.yaml from specs/main/contracts/ to rescan/k8s/service.yaml
- [ ] T017 [P] [US4] Copy deployment.yaml from specs/main/contracts/ to rescan/k8s/deployment.yaml

### Manifest Customization

- [ ] T018 [US4] Update deployment.yaml image reference to match your Docker image tag
- [ ] T019 [US4] Verify all manifest files have correct namespace: rescan
- [ ] T020 [US4] Update secret.yaml.example with placeholder instructions
- [ ] T021 [US4] Update .gitignore to exclude k8s/secret.yaml (real secrets)

**Checkpoint**: All Kubernetes manifests exist in k8s/ directory with correct configuration

---

## Phase 4: Local Kubernetes Deployment (kind/minikube)

**Purpose**: Deploy and test the application in a local Kubernetes cluster

**Goal**: Verify containerized application works in Kubernetes environment

### Cluster Setup

- [ ] T022 [US4] Setup local Kubernetes cluster (kind or minikube)
- [ ] T023 [US4] Load Docker image into cluster: `kind load docker-image rescan:v1.0.0`

### Kubernetes Deployment

- [ ] T024 [US4] Create namespace: `kubectl apply -f k8s/namespace.yaml`
- [ ] T025 [US4] Create ConfigMap: `kubectl apply -f k8s/configmap.yaml`
- [ ] T026 [US4] Create Secret with real Azure OpenAI credentials (via kubectl create secret)
- [ ] T027 [US4] Create PersistentVolumeClaim: `kubectl apply -f k8s/pvc.yaml`
- [ ] T028 [US4] Verify PVC is bound: `kubectl get pvc -n rescan`
- [ ] T029 [US4] Initialize database in pod (run db:setup via kubectl exec or init container)
- [ ] T030 [US4] Deploy application: `kubectl apply -f k8s/deployment.yaml`
- [ ] T031 [US4] Verify deployment rollout: `kubectl rollout status deployment/rescan-app -n rescan`
- [ ] T032 [US4] Create service: `kubectl apply -f k8s/service.yaml`

**Checkpoint**: All pods running, deployment successful, service created

---

## Phase 5: Deployment Verification & Testing

**Purpose**: Validate the deployed application meets all functional requirements

**Goal**: Confirm all User Story 4 acceptance scenarios pass

### Health & Readiness Checks

- [ ] T033 [US4] Verify liveness probe working: `kubectl describe pod -n rescan -l app=rescan` (check Liveness section)
- [ ] T034 [US4] Verify readiness probe working: `kubectl get pods -n rescan` (check READY column shows 1/1)
- [ ] T035 [US4] Test health endpoint via port-forward: `kubectl port-forward -n rescan svc/rescan-service 3000:3000`
- [ ] T036 [US4] Curl health endpoint: `curl http://localhost:3000/health`
- [ ] T037 [US4] Curl ready endpoint: `curl http://localhost:3000/ready`

### Application Functionality Testing

- [ ] T038 [US4] Test homepage loads: `curl http://localhost:3000/`
- [ ] T039 [US4] Test address lookup API endpoint works
- [ ] T040 [US4] Test image upload endpoint works
- [ ] T041 [US4] Verify database persistence across pod restart: `kubectl delete pod -n rescan -l app=rescan`
- [ ] T042 [US4] Wait for new pod to start and verify data still exists

### Pod Resilience Testing

- [ ] T043 [US4] Test automatic pod restart on failure (kill container process)
- [ ] T044 [US4] Verify Kubernetes restarts pod automatically
- [ ] T045 [US4] Check pod logs: `kubectl logs -n rescan -l app=rescan --tail=50`

**Checkpoint**: All User Story 4 acceptance scenarios pass ✅

---

## Phase 6: Configuration Management Testing

**Purpose**: Verify environment-specific configuration works correctly

**Goal**: Test ConfigMap and Secret updates without rebuilding image

- [ ] T046 [US4] Update ConfigMap value: `kubectl edit configmap rescan-config -n rescan`
- [ ] T047 [US4] Restart deployment to pick up changes: `kubectl rollout restart deployment/rescan-app -n rescan`
- [ ] T048 [US4] Verify new configuration applied in pod environment variables
- [ ] T049 [US4] Test deployment with different NODE_ENV values (development vs production)

**Checkpoint**: Configuration updates work without rebuilding Docker image

---

## Phase 7: Documentation & Polish

**Purpose**: Complete documentation and prepare for production deployment

**Goal**: Ensure all deployment documentation is accurate and comprehensive

- [ ] T050 [P] [US4] Update main README.md with Docker build instructions
- [ ] T051 [P] [US4] Update README.md with Kubernetes deployment instructions
- [ ] T052 [P] [US4] Verify quickstart.md accuracy (test all commands in guide)
- [ ] T053 [P] [US4] Add comments to Dockerfile explaining each stage
- [ ] T054 [P] [US4] Add comments to Kubernetes manifests explaining educational concepts
- [ ] T055 [P] [US4] Create troubleshooting section in README.md for common issues
- [ ] T056 [P] [US4] Document backup and restore procedures for database

**Checkpoint**: Documentation complete and tested

---

## Phase 8: Optional Enhancements (Post-MVP)

**Purpose**: Additional improvements beyond core requirements

**Goal**: Production readiness and operational excellence

- [ ] T057 [P] [US4] Add resource monitoring: `kubectl top pods -n rescan`
- [ ] T058 [P] [US4] Test horizontal scaling (if migrating to PostgreSQL)
- [ ] T059 [P] [US4] Add Ingress configuration for HTTP routing
- [ ] T060 [P] [US4] Setup CI/CD pipeline for automated builds
- [ ] T061 [P] [US4] Add Prometheus metrics endpoint
- [ ] T062 [P] [US4] Create Helm chart for easier deployment

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1** (Health Checks): Can start immediately - no dependencies
2. **Phase 2** (Docker): Depends on Phase 1 completion (needs health endpoints)
3. **Phase 3** (K8s Manifests): Can run in parallel with Phase 2 (independent files)
4. **Phase 4** (Deployment): Depends on Phase 2 (needs Docker image) and Phase 3 (needs manifests)
5. **Phase 5** (Verification): Depends on Phase 4 (needs running deployment)
6. **Phase 6** (Config Testing): Depends on Phase 4 (needs running deployment)
7. **Phase 7** (Documentation): Can start anytime, finalize after Phase 6
8. **Phase 8** (Enhancements): Optional, depends on all previous phases

### User Story Dependencies

**User Story 4 (P4) - Container Deployment** depends on:
- User Story 1 (P1): ✅ Already implemented (address lookup, database)
- User Story 2 (P2): ✅ Already implemented (AI scanning, file upload)
- User Story 3 (P3): ✅ Already implemented (camera integration)

All prerequisite user stories are complete, so US4 can proceed.

### Critical Path

The critical path for container deployment is:
1. Health endpoints (T001-T003)
2. Dockerfile creation (T004-T006)
3. Docker build (T007-T010)
4. K8s manifests (T011-T021)
5. Deployment (T022-T032)
6. Verification (T033-T045)

**Estimated Time**: 4-6 hours for experienced developers, 8-12 hours for students learning containerization

### Parallel Opportunities

- **Phase 1**: All health endpoint tasks (T001-T002) can be done simultaneously by different developers
- **Phase 2**: T004, T005, T006 (Docker config files) can be created in parallel
- **Phase 3**: T012-T017 (copying manifests) can all be done in parallel
- **Phase 7**: All documentation tasks (T050-T056) can be done in parallel

### Task Groupings for Team Assignment

If working with a team, assign these groups:

- **Developer A**: Health endpoints (T001-T003) → Docker (T004-T010) → Testing (T033-T045)
- **Developer B**: K8s manifests (T011-T021) → Deployment (T022-T032) → Config testing (T046-T049)
- **Developer C**: Documentation (T050-T056) → Optional enhancements (T057-T062)

---

## Success Criteria Verification

Upon completion of all tasks, verify these success criteria from spec.md:

- ✅ **SC-011**: Docker image builds successfully and runs application without errors
- ✅ **SC-012**: Application deploys to Kubernetes cluster within 5 minutes
- ✅ **SC-013**: Application scales horizontally with multiple pod replicas handling requests
- ✅ **SC-014**: Container restarts automatically on failure without data loss
- ✅ **SC-015**: Configuration changes deploy without rebuilding container image
- ✅ **SC-016**: Application accessible via Kubernetes service endpoint after deployment

---

## Educational Learning Objectives

After completing these tasks, students should understand:

- [ ] Multi-stage Docker builds and image optimization
- [ ] Container security best practices (non-root user, minimal images)
- [ ] Kubernetes resource types and their relationships
- [ ] Pod lifecycle management with health probes
- [ ] Configuration management with ConfigMaps and Secrets
- [ ] Persistent storage in Kubernetes with PVCs
- [ ] Service discovery and networking in K8s
- [ ] Deployment strategies and rolling updates
- [ ] Troubleshooting containerized applications
- [ ] Cloud-native application architecture principles

---

## Quick Reference Commands

### Docker Commands
```bash
# Build image
docker build -t rescan:v1.0.0 .

# Run locally
docker run -p 3000:3000 --env-file .env rescan:v1.0.0

# Check logs
docker logs <container-id>
```

### Kubernetes Commands
```bash
# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get all -n rescan

# View logs
kubectl logs -n rescan -l app=rescan --tail=100 -f

# Port forward for testing
kubectl port-forward -n rescan svc/rescan-service 3000:3000

# Restart deployment
kubectl rollout restart deployment/rescan-app -n rescan
```

### Troubleshooting Commands
```bash
# Describe pod to see events
kubectl describe pod -n rescan <pod-name>

# Check pod resource usage
kubectl top pods -n rescan

# Get pod events
kubectl get events -n rescan --sort-by='.lastTimestamp'

# Exec into pod
kubectl exec -it -n rescan <pod-name> -- sh
```

---

**Task List Generated**: 2026-02-22  
**Total Tasks**: 62 (57 core + 5 optional)  
**Estimated Duration**: 8-12 hours for students  
**Prerequisites Met**: ✅ US1, US2, US3 implemented  
**Next Phase**: Begin implementation with Phase 1 (Health Checks)
