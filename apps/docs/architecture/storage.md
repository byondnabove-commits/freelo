# Storage Architecture

## Overview

FreeLo allows organizations to upload and manage files associated with:

* Leads
* Clients
* Projects
* Proposals
* Invoices
* Forms
* Client Portal

The storage system must be:

* Simple to operate
* Cost effective
* Secure
* Scalable
* Multi-tenant aware

---

# Storage Philosophy

Storage should provide the best possible user experience.

Users should be able to upload files immediately without requiring external integrations.

Example:

Good:

Upload File
→ Done

Bad:

Upload File
→ Connect Google Drive
→ Grant Permissions
→ Select Folder
→ Upload

The MVP prioritizes simplicity and speed.

---

# Storage Provider

Primary Storage Provider:

Cloudflare R2

Reasons:

* Low cost
* S3 compatible
* No egress fees
* Easy integration
* Global availability
* Scales with the product

FreeLo does not store uploaded files on the VPS.

The VPS is responsible only for application logic.

---

# Storage Roadmap

## Phase 1

Managed Storage

Provider:

Cloudflare R2

Users upload files directly into FreeLo.

FreeLo manages:

* Uploads
* Access control
* File metadata

---

## Phase 2

Storage Integrations

Supported providers:

* Google Drive
* Dropbox
* OneDrive

Users may connect external storage providers.

---

## Phase 3

Bring Your Own Storage

Organizations choose:

* FreeLo Storage
* Google Drive
* Dropbox
* OneDrive

Storage becomes configurable.

---

# Supported Files

## Supported

Documents:

* PDF
* DOCX
* XLSX
* PPTX
* TXT

Images:

* PNG
* JPG
* JPEG
* WEBP
* SVG

Project Assets:

* ZIP

---

## Not Supported Initially

Large media files:

* MP4
* MOV
* AVI
* RAW Video
* Screen Recordings

Reasons:

* High storage consumption
* High bandwidth usage
* Low value for MVP

Video support may be added in future versions.

---

# Multi-Tenant Storage Model

Every uploaded file belongs to an organization.

Relationship:

Organization
→ Files

File access is organization scoped.

Users may only access files belonging to their organization.

---

# File Ownership

Every file record must contain:

```ts
id

organizationId

uploadedBy

name

mimeType

size

storageKey

createdAt
```

---

# Storage Key Convention

Files should be organized by organization.

Example:

```txt
organizations/
  org_123/
    projects/
      project_456/
        proposal.pdf
```

Example:

```txt
organizations/
  org_123/
    clients/
      client_789/
        logo.png
```

Benefits:

* Easier debugging
* Easier cleanup
* Easier migrations

---

# Database Storage

The database stores metadata only.

The database does not store file contents.

Store:

```ts
id

organizationId

storageKey

name

mimeType

size

uploadedBy

createdAt
```

Do not store:

```txt
file binary
base64
raw file content
```

inside PostgreSQL.

---

# Upload Flow

User Uploads File

↓

Backend Validates Session

↓

Backend Validates Organization

↓

Backend Validates Storage Limits

↓

File Uploaded To R2

↓

Metadata Stored In Database

↓

Success Response

---

# Download Flow

User Requests File

↓

Backend Validates Session

↓

Backend Validates Organization Ownership

↓

Generate Signed URL

↓

Return Signed URL

↓

File Download

Files should never be publicly accessible.

---

# Security Rules

All uploads require authentication.

All downloads require authentication.

Files must be organization scoped.

Never expose raw storage paths.

Use signed URLs for downloads.

Validate:

* File type
* File size
* Organization ownership

before allowing uploads.

---

# File Limits

## Sketchbook

Storage Limit:

5 GB

Recommended Usage:

* Proposals
* Contracts
* Client Assets
* Project Documents

---

## Studio

Storage Limit:

50 GB

Recommended Usage:

* Team Collaboration
* Project Assets
* Client Deliverables
* Shared Resources

---

# Storage Usage Tracking

Each organization tracks usage.

Example:

```ts
organizationProfile.storageUsedBytes
```

or

```ts
organizationStorage
```

table.

Uploads must verify remaining quota before processing.

---

# Image Optimization

Images should be optimized before storage.

Recommended:

* Resize oversized images
* Convert to WEBP when possible
* Compress uploads

Benefits:

* Lower storage costs
* Faster uploads
* Faster downloads

---

# Cost Management Strategy

The MVP should focus on:

* Documents
* Images
* Contracts
* Proposals
* Invoices

Avoid hosting:

* Large videos
* Media libraries
* Raw footage

Storage growth should remain predictable.

---

# Future Enhancements

Potential future additions:

* Google Drive Integration
* Dropbox Integration
* OneDrive Integration
* File Versioning
* Folder Organization
* Shared Assets Library
* Organization Storage Analytics
* Storage Add-On Packages

---

# Architectural Principles

* Storage is organization scoped.
* Files belong to organizations.
* PostgreSQL stores metadata only.
* Cloudflare R2 stores file contents.
* VPS never stores uploaded files.
* Downloads use signed URLs.
* Storage limits are enforced by subscription.
* Storage is a business capability, not a permission.
* Integrations are optional enhancements, not requirements.
