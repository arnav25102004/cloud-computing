import React, { useState } from 'react';

const API = 'http://localhost:5000/api';

const REGIONS = [
  { value: 'us-east-1',      label: 'US East (N. Virginia) — us-east-1' },
  { value: 'us-east-2',      label: 'US East (Ohio) — us-east-2' },
  { value: 'us-west-1',      label: 'US West (N. California) — us-west-1' },
  { value: 'us-west-2',      label: 'US West (Oregon) — us-west-2' },
  { value: 'ap-south-1',     label: 'Asia Pacific (Mumbai) — ap-south-1' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore) — ap-southeast-1' },
  { value: 'eu-west-1',      label: 'Europe (Ireland) — eu-west-1' },
];

function s3Url(bucket, region, key) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
}

/* ─────────────── CSS ─────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0b0f1a;font-family:'Inter',system-ui,sans-serif;color:#e2e8f0;min-height:100vh}

/* HERO */
.hero{background:linear-gradient(135deg,#0b0f1a 0%,#131929 60%,#0b0f1a 100%);border-bottom:1px solid #1a2236;padding:52px 40px 44px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-100px;left:-60px;width:380px;height:380px;background:radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-80px;right:40px;width:300px;height:300px;background:radial-gradient(circle,rgba(16,185,129,.12) 0%,transparent 70%);pointer-events:none}
.hero-inner{max-width:1060px;margin:0 auto;position:relative;z-index:1}
.hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.28);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:#a5b4fc;letter-spacing:.04em;margin-bottom:22px}
.live-dot{width:7px;height:7px;background:#6366f1;border-radius:50%;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
.hero-title{font-size:46px;font-weight:800;line-height:1.12;background:linear-gradient(135deg,#f1f5f9 30%,#818cf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px}
.hero-meta{display:flex;align-items:center;gap:0;flex-wrap:wrap}
.hero-chip{display:flex;align-items:center;gap:8px;font-size:13px;color:#94a3b8;padding:0 18px}
.hero-chip:first-child{padding-left:0}
.chip-icon{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:15px}
.chip-icon.purple{background:rgba(99,102,241,.15)}
.chip-icon.green{background:rgba(16,185,129,.15)}
.chip-icon.amber{background:rgba(245,158,11,.15)}
.sep{width:1px;height:28px;background:#1e2a3a}

/* LAYOUT */
.main{max-width:1060px;margin:0 auto;padding:36px 40px 20px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}

/* STATUS */
.status{padding:14px 18px;border-radius:10px;font-size:14px;margin-bottom:26px;display:flex;align-items:flex-start;gap:10px;font-weight:500;line-height:1.5}
.status.ok{background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.22);color:#34d399}
.status.err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.22);color:#f87171}
.status-icon{font-size:16px;flex-shrink:0;margin-top:1px}

/* CARD */
.card{background:#111827;border:1px solid #1e2a3a;border-radius:16px;padding:28px;transition:border-color .2s}
.card:hover{border-color:#2d3f55}
.card-head{display:flex;align-items:center;gap:12px;margin-bottom:6px}
.step{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0}
.step.blue{background:rgba(99,102,241,.18);color:#818cf8}
.step.green{background:rgba(16,185,129,.18);color:#34d399}
.step.amber{background:rgba(245,158,11,.18);color:#fbbf24}
.step.red{background:rgba(239,68,68,.18);color:#f87171}
.card-title{font-size:17px;font-weight:700;color:#f1f5f9}
.card-desc{font-size:13px;color:#4b5e78;margin-bottom:22px;padding-left:44px}

/* FORM */
.flabel{font-size:11px;font-weight:700;color:#64748b;letter-spacing:.06em;text-transform:uppercase;display:block;margin-bottom:7px}
.fgroup{margin-bottom:16px}
.finput,.fselect{width:100%;padding:11px 14px;background:#0b0f1a;border:1px solid #1e2a3a;border-radius:8px;color:#e2e8f0;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s;appearance:none}
.finput::placeholder{color:#2d3f55}
.finput:focus,.fselect:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(99,102,241,.15)}
.hint{font-size:11px;color:#334155;margin-top:5px}

/* BUTTONS */
.btn{width:100%;padding:12px 18px;border:none;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .15s,transform .1s;letter-spacing:.02em;margin-top:6px;font-family:inherit}
.btn:hover:not(:disabled){opacity:.85;transform:translateY(-1px)}
.btn:active:not(:disabled){transform:translateY(0)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-blue{background:linear-gradient(135deg,#4338ca,#6366f1);color:#fff}
.btn-green{background:linear-gradient(135deg,#047857,#10b981);color:#fff}
.btn-red{background:linear-gradient(135deg,#991b1b,#ef4444);color:#fff;margin-top:14px}

/* NOTICE */
.notice-ok{margin-top:14px;padding:11px 14px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:8px;font-size:13px;color:#34d399}
.staged{margin-top:14px;padding:10px 14px;background:#0b0f1a;border:1px solid #1e2a3a;border-radius:8px;font-size:12px;color:#4b5e78}
.staged strong{color:#64748b}

/* TABLE */
.tbl-wrap{border:1px solid #1e2a3a;border-radius:12px;overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:14px}
thead tr{background:#0d1320;border-bottom:1px solid #1e2a3a}
th{padding:13px 16px;font-size:10px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:.07em;text-align:left}
th:last-child{text-align:right}
td{padding:15px 16px;border-bottom:1px solid #141d2e;color:#cbd5e1;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.015)}
td.fname{font-family:'Courier New',monospace;color:#a5b4fc;font-size:13px}
td.actions{text-align:right}

/* ACL BADGE */
.badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.05em}
.badge.priv{background:rgba(71,85,105,.25);color:#64748b;border:1px solid #1e2a3a}
.badge.pub{background:rgba(245,158,11,.12);color:#f59e0b;border:1px solid rgba(245,158,11,.25)}
.bdot{width:6px;height:6px;border-radius:50%}
.bdot.priv{background:#475569}
.bdot.pub{background:#f59e0b}

/* ACL BUTTONS */
.ab{padding:6px 13px;font-size:12px;font-weight:600;border-radius:7px;cursor:pointer;transition:opacity .15s,transform .1s;border:none;font-family:inherit;margin-left:7px}
.ab:first-child{margin-left:0}
.ab:hover:not(:disabled){opacity:.8;transform:translateY(-1px)}
.ab:disabled{opacity:.35;cursor:not-allowed}
.ab.priv{background:#1a2236;color:#94a3b8;border:1px solid #2d3f55}
.ab.pub{background:linear-gradient(135deg,#b45309,#d97706);color:#fff}

/* PUBLIC LINK */
.pub-link{display:inline-flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;color:#60a5fa;text-decoration:none;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:6px;padding:4px 10px;max-width:260px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;transition:background .15s}
.pub-link:hover{background:rgba(59,130,246,.15)}

/* EMPTY */
.empty{padding:52px;text-align:center;color:#1e2a3a}
.empty-icon{font-size:40px;margin-bottom:14px}
.empty-txt{color:#334155;font-size:14px}

/* CONFIRM MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px)}
.modal{background:#111827;border:1px solid #2d3f55;border-radius:16px;padding:32px;max-width:420px;width:90%;text-align:center}
.modal h3{font-size:20px;font-weight:700;color:#f87171;margin-bottom:12px}
.modal p{font-size:14px;color:#64748b;line-height:1.6;margin-bottom:24px}
.modal strong{color:#e2e8f0}
.modal-btns{display:flex;gap:12px;justify-content:center}
.modal-btns button{flex:1;padding:11px;border:none;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}
.modal-cancel{background:#1e2a3a;color:#94a3b8;border:1px solid #2d3f55 !important}
.modal-confirm{background:linear-gradient(135deg,#991b1b,#ef4444);color:#fff}

/* DANGER CARD */
.danger-card{border-color:#2d1515 !important}
.danger-card:hover{border-color:#7f1d1d !important}

/* FOOTER */
.footer{border-top:1px solid #1a2234;margin-top:36px;padding:40px;display:flex;align-items:center;justify-content:center;gap:20px}
.footer-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #2d3f55}
.footer-avatar-fallback{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#4338ca,#6366f1);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;flex-shrink:0;border:2px solid #3730a3}
.footer-text{}
.footer-name{font-size:16px;font-weight:700;color:#e2e8f0}
.footer-sub{font-size:12px;color:#334155;margin-top:3px}
`;

/* ─────────────── COMPONENTS ─────────────── */
function AclBadge({ acl }) {
  const pub = acl === 'public-read';
  return (
    <span className={`badge ${pub ? 'pub' : 'priv'}`}>
      <span className={`bdot ${pub ? 'pub' : 'priv'}`} />
      {pub ? 'PUBLIC READ' : 'PRIVATE'}
    </span>
  );
}

function StatusBar({ msg }) {
  if (!msg.text) return null;
  return (
    <div className={`status ${msg.isError ? 'err' : 'ok'}`}>
      <span className="status-icon">{msg.isError ? '✕' : '✓'}</span>
      <span>{msg.text}</span>
    </div>
  );
}

function ConfirmModal({ bucketName, onConfirm, onCancel, loading }) {
  return (
    <div className="overlay">
      <div className="modal">
        <h3>Delete Bucket?</h3>
        <p>
          This will permanently delete <strong>{bucketName}</strong> and{' '}
          <strong>all files inside it</strong>. This action cannot be undone.
        </p>
        <div className="modal-btns">
          <button className="modal-cancel" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="modal-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── APP ─────────────── */
export default function App() {
  const [bucketName, setBucketName]   = useState('');
  const [region, setRegion]           = useState('us-east-1');
  const [bucketCreated, setBucketCreated] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedObjects, setUploadedObjects] = useState([]);
  const [status, setStatus]           = useState({ text: '', isError: false });
  const [loading, setLoading]         = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const show = (text, isError = false) => setStatus({ text, isError });
  const bucket = bucketName.toLowerCase().trim();

  /* ── Create Bucket ── */
  const handleCreateBucket = async (e) => {
    e.preventDefault();
    if (!bucket) return show('Please enter a bucket name.', true);
    setLoading('create');
    try {
      const res  = await fetch(`${API}/create-bucket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName: bucket, region })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setBucketCreated(true);
      setUploadedObjects([]);
      show(data.message);
    } catch (err) { show(err.message, true); }
    finally { setLoading(''); }
  };

  /* ── Upload ── */
  const handleUpload = async () => {
    if (!bucket)                    return show('Create or enter a bucket name first.', true);
    if (selectedFiles.length === 0) return show('Select at least one file to upload.', true);
    setLoading('upload');
    try {
      const fd = new FormData();
      fd.append('bucketName', bucket);
      fd.append('region', region);
      selectedFiles.forEach(f => fd.append('files', f));
      const res  = await fetch(`${API}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setUploadedObjects(prev => [...prev, ...data.files]);
      setSelectedFiles([]);
      show(data.message);
    } catch (err) { show(err.message, true); }
    finally { setLoading(''); }
  };

  /* ── ACL Change (optimistic update — revert on error) ── */
  const handleChangeACL = async (objectKey, acl) => {
    const prev = uploadedObjects.find(o => o.key === objectKey)?.acl;
    // Optimistically update UI immediately
    setUploadedObjects(list => list.map(o => o.key === objectKey ? { ...o, acl } : o));
    setLoading(objectKey);
    try {
      const res  = await fetch(`${API}/set-acl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName: bucket, objectKey, acl, region })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      show(data.message);
    } catch (err) {
      // Revert optimistic update if the API call failed
      setUploadedObjects(list => list.map(o => o.key === objectKey ? { ...o, acl: prev } : o));
      show(err.message, true);
    }
    finally { setLoading(''); }
  };

  /* ── Delete Bucket ── */
  const handleDeleteBucket = async () => {
    setLoading('delete');
    try {
      const res  = await fetch(`${API}/delete-bucket`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName: bucket, region })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setBucketCreated(false);
      setBucketName('');
      setUploadedObjects([]);
      setShowConfirm(false);
      show(data.message);
    } catch (err) { show(err.message, true); setShowConfirm(false); }
    finally { setLoading(''); }
  };

  return (
    <>
      <style>{css}</style>

      {showConfirm && (
        <ConfirmModal
          bucketName={bucket}
          onConfirm={handleDeleteBucket}
          onCancel={() => setShowConfirm(false)}
          loading={loading === 'delete'}
        />
      )}

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-tag">
            <span className="live-dot" /> AWS S3 · Live
          </div>
          <h1 className="hero-title">Amazon S3<br />File Manager</h1>
          <div className="hero-meta">
            <div className="hero-chip">
              <div className="chip-icon purple">👤</div>
              <span><strong style={{ color: '#e2e8f0' }}>Arnav Narula</strong>&nbsp;&nbsp;2547115</span>
            </div>
            <div className="sep" />
            <div className="hero-chip">
              <div className="chip-icon green">🏫</div>
              <span>CHRIST (Deemed to be University)</span>
            </div>
            <div className="sep" />
            <div className="hero-chip">
              <div className="chip-icon amber">🧪</div>
              <span>Cloud Computing Lab — CO1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main">
        <StatusBar msg={status} />

        <div className="grid2">
          {/* Step 1 — Create */}
          <div className="card">
            <div className="card-head">
              <div className="step blue">1</div>
              <span className="card-title">Create S3 Bucket</span>
            </div>
            <p className="card-desc">Specify a globally unique bucket name and AWS region.</p>
            <form onSubmit={handleCreateBucket}>
              <div className="fgroup">
                <label className="flabel">Bucket Name</label>
                <input
                  className="finput" type="text"
                  placeholder="e.g. christ-mca-2547115"
                  value={bucketName}
                  onChange={e => { setBucketName(e.target.value); setBucketCreated(false); }}
                  required
                />
                <p className="hint">Lowercase, numbers, hyphens only. Must be globally unique.</p>
              </div>
              <div className="fgroup">
                <label className="flabel">Region</label>
                <select className="fselect" value={region} onChange={e => setRegion(e.target.value)}>
                  {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <button className="btn btn-blue" type="submit" disabled={loading === 'create'}>
                {loading === 'create' ? 'Creating…' : 'Create Bucket'}
              </button>
            </form>

            {bucketCreated && (
              <div className="notice-ok">
                ✓ &nbsp;<strong>{bucket}</strong> is ready in {region}
              </div>
            )}
          </div>

          {/* Step 2 — Upload */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-head">
                <div className="step green">2</div>
                <span className="card-title">Upload Files</span>
              </div>
              <p className="card-desc">Select one or more files to upload into the bucket.</p>
              <div className="fgroup">
                <label className="flabel">Select Files</label>
                <input
                  type="file" multiple
                  onChange={e => setSelectedFiles(Array.from(e.target.files))}
                  style={{ fontSize: '13px', color: '#4b5e78', cursor: 'pointer' }}
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="staged">
                  <strong>Staged ({selectedFiles.length}):</strong>{' '}
                  {selectedFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
            <button
              className="btn btn-green"
              onClick={handleUpload}
              disabled={loading === 'upload'}
              style={{ marginTop: '24px' }}
            >
              {loading === 'upload'
                ? 'Uploading…'
                : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}` : 'Files'}`}
            </button>
          </div>
        </div>

        {/* Step 3 — ACL */}
        <div className="card">
          <div className="card-head">
            <div className="step amber">3</div>
            <span className="card-title">Manage Object Access Permissions</span>
          </div>
          <p className="card-desc">
            Toggle each file between Private and Public Read. Public files show a direct link you can open.
          </p>

          {uploadedObjects.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📂</div>
              <p className="empty-txt">No files uploaded yet. Uploaded files will appear here.</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Access Level</th>
                    <th style={{ textAlign: 'right' }}>Change Access</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedObjects.map(obj => (
                    <tr key={obj.key}>
                      <td className="fname">
                        <div>{obj.key}</div>
                        {obj.acl === 'public-read' && (
                          <a
                            className="pub-link"
                            href={s3Url(bucket, region, obj.key)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={s3Url(bucket, region, obj.key)}
                          >
                            🔗 Open file in new tab
                          </a>
                        )}
                      </td>
                      <td><AclBadge acl={obj.acl} /></td>
                      <td className="actions">
                        <button
                          className="ab priv"
                          disabled={loading === obj.key || obj.acl === 'private'}
                          onClick={() => handleChangeACL(obj.key, 'private')}
                        >
                          Set Private
                        </button>
                        <button
                          className="ab pub"
                          disabled={loading === obj.key || obj.acl === 'public-read'}
                          onClick={() => handleChangeACL(obj.key, 'public-read')}
                        >
                          Set Public Read
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Step 4 — Danger Zone */}
        {bucket && (
          <div className="card danger-card" style={{ marginTop: '24px' }}>
            <div className="card-head">
              <div className="step red">4</div>
              <span className="card-title">Danger Zone</span>
            </div>
            <p className="card-desc">
              Permanently delete <strong style={{ color: '#e2e8f0' }}>{bucket}</strong> and all its contents from AWS S3. This cannot be undone.
            </p>
            <button
              className="btn btn-red"
              style={{ maxWidth: '280px', marginTop: 0 }}
              onClick={() => setShowConfirm(true)}
              disabled={!!loading}
            >
              🗑 &nbsp;Delete Bucket &amp; All Contents
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          {!avatarError ? (
            <img
              src="/profile.png"
              alt="Arnav Narula"
              className="footer-avatar"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="footer-avatar-fallback">AN</div>
          )}
          <div className="footer-text">
            <div className="footer-name">Arnav Narula</div>
            <div className="footer-sub">2547115 &nbsp;·&nbsp; MCA Cloud Computing &nbsp;·&nbsp; CHRIST (Deemed to be University)</div>
          </div>
        </div>
      </div>
    </>
  );
}
