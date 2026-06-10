require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  PutObjectAclCommand,
  PutBucketOwnershipControlsCommand,
  PutPublicAccessBlockCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  DeleteBucketCommand
} = require('@aws-sdk/client-s3');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

function getS3Client(region) {
  return new S3Client({
    region: region || process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN
    }
  });
}

// POST /api/create-bucket
app.post('/api/create-bucket', async (req, res) => {
  const { bucketName, region } = req.body;
  if (!bucketName) return res.status(400).json({ success: false, message: 'Bucket name is required.' });

  const s3 = getS3Client(region);
  const params = { Bucket: bucketName };
  if (region && region !== 'us-east-1') {
    params.CreateBucketConfiguration = { LocationConstraint: region };
  }

  try {
    await s3.send(new CreateBucketCommand(params));

    // Disable Block Public Access so public-read ACLs work
    await s3.send(new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    }));

    // Enable object ACLs (required since AWS April 2023 change)
    await s3.send(new PutBucketOwnershipControlsCommand({
      Bucket: bucketName,
      OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerPreferred' }] }
    }));

    res.json({ success: true, message: `Bucket "${bucketName}" created in ${region || 'us-east-1'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/upload
app.post('/api/upload', upload.array('files'), async (req, res) => {
  const { bucketName, region } = req.body;
  if (!bucketName || !req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Bucket name and at least one file are required.' });
  }

  const s3 = getS3Client(region);
  try {
    const uploaded = [];
    for (const file of req.files) {
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
      }));
      uploaded.push({ key: file.originalname, acl: 'private' });
    }
    res.json({ success: true, files: uploaded, message: `${uploaded.length} file(s) uploaded successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/set-acl
app.post('/api/set-acl', async (req, res) => {
  const { bucketName, objectKey, acl, region } = req.body;
  if (!bucketName || !objectKey || !acl) {
    return res.status(400).json({ success: false, message: 'bucketName, objectKey, and acl are required.' });
  }

  const s3 = getS3Client(region);
  try {
    await s3.send(new PutObjectAclCommand({ Bucket: bucketName, Key: objectKey, ACL: acl }));
    res.json({ success: true, message: `"${objectKey}" is now ${acl === 'public-read' ? 'Public Read' : 'Private'}.` });
  } catch (err) {
    // PutObjectAcl can be blocked in some AWS Academy accounts.
    // Fall back: if the error is AccessControlListNotSupported, tell the client explicitly.
    const code = err.name || err.Code || '';
    if (code === 'AccessControlListNotSupported') {
      return res.status(403).json({
        success: false,
        message: 'This AWS account has ACLs disabled. Enable "ACLs enabled" under Bucket Ownership Controls in the AWS Console.'
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/delete-bucket  — empties then deletes the bucket
app.delete('/api/delete-bucket', async (req, res) => {
  const { bucketName, region } = req.body;
  if (!bucketName) return res.status(400).json({ success: false, message: 'Bucket name is required.' });

  const s3 = getS3Client(region);
  try {
    // List and delete all objects first (bucket must be empty to delete)
    let continuationToken;
    do {
      const listed = await s3.send(new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken
      }));

      if (listed.Contents && listed.Contents.length > 0) {
        await s3.send(new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: { Objects: listed.Contents.map(o => ({ Key: o.Key })) }
        }));
      }
      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : null;
    } while (continuationToken);

    // Now delete the empty bucket
    await s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
    res.json({ success: true, message: `Bucket "${bucketName}" and all its contents have been deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
