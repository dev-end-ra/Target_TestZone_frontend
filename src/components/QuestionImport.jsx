import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileJson, FileText, Download, Eye, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

// ── CSV parser ────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    // Handle commas inside quotes
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; continue; }
      if (line[i] === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += line[i];
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? ''; });
    return csvRowToQuestion(row);
  }).filter(q => q.text);
}

function csvRowToQuestion(row) {
  return {
    subject:            row.subject || 'General',
    chapter:            row.chapter || 'General',
    text:               row.question || row.text || '',
    options:            [row.option_a||row.A, row.option_b||row.B, row.option_c||row.C, row.option_d||row.D].filter(Boolean),
    correctOptionIndex: parseInt(row.correct_option ?? row.correct ?? 0),
    solutionText:       row.solution || row.solutionText || '',
    marks:              parseInt(row.marks) || 2,
    negativeMarks:      parseInt(row.negative_marks) || 0,
    questionImage:      row.image_url || row.questionImage || null,
  };
}

// ── Templates ─────────────────────────────────────────────────
const CSV_TEMPLATE = `subject,chapter,question,option_a,option_b,option_c,option_d,correct_option,solution,marks,negative_marks,image_url
Physics,Newton's Laws,What is the SI unit of force?,Newton,Joule,Watt,Pascal,0,The SI unit of force is Newton (N).,2,0,
Chemistry,Solid State,Number of atoms in FCC unit cell?,4,2,1,8,0,FCC: 8×1/8 + 6×1/2 = 4.,2,0,
Mathematics,Calculus,d/dx of sin(x) is?,cos(x),-cos(x),sin(x),-sin(x),0,Standard derivative.,2,0,`;

const JSON_TEMPLATE = JSON.stringify([{
  subject: "Physics",
  chapter: "Newton's Laws",
  text: "What is the SI unit of force?",
  options: ["Newton", "Joule", "Watt", "Pascal"],
  correctOptionIndex: 0,
  solutionText: "The SI unit of force is Newton (N).",
  marks: 2,
  negativeMarks: 0,
  questionImage: null
}], null, 2);

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ── Component ─────────────────────────────────────────────────
export default function QuestionImport({ tests }) {
  const [testId, setTestId]       = useState('');
  const [parsed, setParsed]       = useState([]);
  const [preview, setPreview]     = useState(false);
  const [status, setStatus]       = useState({ type: '', msg: '' });
  const [importing, setImporting] = useState(false);
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef();

  const token  = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
  };

  const processFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let questions = [];
        if (ext === 'json') questions = JSON.parse(e.target.result);
        else if (ext === 'csv') questions = parseCSV(e.target.result);
        else return showStatus('error', 'Only .json and .csv files are supported');
        if (!questions.length) return showStatus('error', 'No valid questions found in file');
        setParsed(questions);
        setPreview(true);
        showStatus('success', `${questions.length} questions parsed successfully — review and confirm import`);
      } catch {
        showStatus('error', 'Failed to parse file. Check format and try again.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!testId) return showStatus('error', 'Please select a test first');
    if (!parsed.length) return showStatus('error', 'No questions to import');
    setImporting(true);
    try {
      await axios.post(`http://localhost:5000/api/admin/tests/${testId}/questions/import`, { questions: parsed }, config);
      showStatus('success', `${parsed.length} questions imported into test successfully!`);
      setParsed([]); setPreview(false);
    } catch (err) {
      showStatus('error', err.response?.data?.message || 'Import failed');
    }
    setImporting(false);
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '860px' }}>

      {status.msg && (
        <div className={`alert animate-fade-in ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>
          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {status.msg}
        </div>
      )}

      {/* Templates */}
      <div className="card card-body" style={{ marginBottom: '20px' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: 0 }}>Download Templates</h4>
          <span className="badge badge-neutral">Step 1</span>
        </div>
        <p style={{ marginBottom: '16px', fontSize: '0.875rem' }}>
          Download a template, fill in your questions, save, and upload below.
          CSV is best for Excel users. JSON supports image URLs natively.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-md" onClick={() => downloadFile(CSV_TEMPLATE, 'questions_template.csv', 'text/csv')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <FileText size={16} /> Download CSV Template
          </button>
          <button className="btn btn-secondary btn-md" onClick={() => downloadFile(JSON_TEMPLATE, 'questions_template.json', 'application/json')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <FileJson size={16} /> Download JSON Template
          </button>
        </div>
      </div>

      {/* Select Test */}
      <div className="card card-body" style={{ marginBottom: '20px' }}>
        <div className="flex-between" style={{ marginBottom: '12px' }}>
          <h4 style={{ margin: 0 }}>Select Target Test</h4>
          <span className="badge badge-neutral">Step 2</span>
        </div>
        <select className="form-select" value={testId} onChange={e => setTestId(e.target.value)}>
          <option value="">Choose a test to import into...</option>
          {tests.map(t => <option key={t._id} value={t._id}>{t.title} ({t.totalQuestions || 0} questions)</option>)}
        </select>
      </div>

      {/* Upload Zone */}
      <div className="card card-body" style={{ marginBottom: '20px' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: 0 }}>Upload Questions File</h4>
          <span className="badge badge-neutral">Step 3</span>
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--brand)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--brand-light)' : 'var(--gray-50)',
            transition: 'all 0.15s',
          }}
        >
          <Upload size={32} color={dragging ? 'var(--brand)' : 'var(--gray-400)'} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: '600', color: dragging ? 'var(--brand)' : 'var(--text-primary)', marginBottom: '4px' }}>
            {dragging ? 'Drop your file here' : 'Drag & drop your .csv or .json file'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or click to browse</p>
          <input ref={fileRef} type="file" accept=".csv,.json" style={{ display: 'none' }}
            onChange={e => processFile(e.target.files[0])} />
        </div>
      </div>

      {/* Preview Table */}
      {preview && parsed.length > 0 && (
        <div className="card animate-slide-up" style={{ marginBottom: '20px' }}>
          <div className="card-header flex-between">
            <h4 style={{ margin: 0 }}>Preview — {parsed.length} Questions</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setParsed([]); setPreview(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--danger)' }}>
                <Trash2 size={13} /> Clear
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '360px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Subject</th><th>Chapter</th>
                  <th style={{ maxWidth: '280px' }}>Question</th>
                  <th>Options</th><th>Correct</th><th>Img</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((q, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{i + 1}</td>
                    <td><span className="badge badge-neutral">{q.subject}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{q.chapter}</td>
                    <td style={{ maxWidth: '280px', fontSize: '0.82rem' }}>{q.text?.slice(0, 90)}{q.text?.length > 90 ? '…' : ''}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.options?.join(' / ')}</td>
                    <td><span className="badge badge-success">{String.fromCharCode(65 + q.correctOptionIndex)}</span></td>
                    <td>{q.questionImage ? '✓' : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer flex-between">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              {parsed.length} questions ready to import
              {!testId && <span style={{ color: 'var(--danger)', marginLeft: '8px' }}>— select a test first</span>}
            </p>
            <button className="btn btn-primary btn-md" onClick={handleImport} disabled={!testId || importing}
              style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              {importing ? 'Importing...' : <><Upload size={15} /> Confirm Import</>}
            </button>
          </div>
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="card card-body" style={{ background: 'var(--gray-50)' }}>
        <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={16} color="var(--brand)" /> CSV Column Reference</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: '0.78rem' }}>
            <thead><tr><th>Column</th><th>Required</th><th>Example</th></tr></thead>
            <tbody>
              {[
                ['subject', 'Yes', 'Physics / Chemistry / Mathematics'],
                ['chapter', 'No', "Newton's Laws"],
                ['question', 'Yes', 'What is the SI unit of force?'],
                ['option_a', 'Yes', 'Newton'],
                ['option_b', 'Yes', 'Joule'],
                ['option_c', 'Yes', 'Watt'],
                ['option_d', 'Yes', 'Pascal'],
                ['correct_option', 'Yes', '0 (index: A=0, B=1, C=2, D=3)'],
                ['solution', 'No', 'SI unit of force is Newton.'],
                ['marks', 'No', '2 (default)'],
                ['negative_marks', 'No', '0 (default)'],
                ['image_url', 'No', 'https://... or leave blank'],
              ].map(([col, req, ex]) => (
                <tr key={col}>
                  <td><code style={{ background: 'var(--gray-200)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem' }}>{col}</code></td>
                  <td><span className={`badge ${req === 'Yes' ? 'badge-danger' : 'badge-neutral'}`}>{req}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
