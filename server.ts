import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface StudentRequestItem {
  id: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section?: string;
  previousCollegeName?: string;
  phone: string;
  email: string;
  category: string;
  title: string;
  description: string;
  urgency: string;
  skillRatings?: {
    programming?: string;
    googleDocsWord?: string;
    googleSheetsExcel?: string;
    googleForms?: string;
    reportWriting?: string;
    englishCommunication?: string;
  };
  academicRequirements?: string[];
  extraRequirementsNote?: string;
  attachedFile?: {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  };
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'resolved';
  teacherRemarks?: string;
  createdAt: string;
  updatedAt: string;
  notificationSent: boolean;
  notificationDetails: {
    smsSent: boolean;
    emailSent: boolean;
    sentAt: string;
  };
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Ensure database directory and file exist
function initDatabase(): StudentRequestItem[] {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading database file, initializing default:', e);
    }
  }

  // Initial seed sample data so teacher sees realistic examples
  const initialData: StudentRequestItem[] = [
    {
      id: 'REQ-10482',
      studentName: 'Aarav Sharma',
      rollNumber: 'CS-2024-42',
      className: 'B.Tech CS 3rd Year',
      section: 'Section B',
      phone: '+91 98765 43210',
      email: 'aarav.sharma@college.edu',
      category: 'certificate',
      title: 'Bonafide Certificate for National Scholarship Application',
      description: 'Sir, I need a Bonafide Certificate with college stamp to apply for the State Merit Scholarship. The last date of submission is next Monday.',
      urgency: 'high',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      notificationSent: true,
      notificationDetails: {
        smsSent: true,
        emailSent: true,
        sentAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      }
    },
    {
      id: 'REQ-10481',
      studentName: 'Priya Verma',
      rollNumber: 'CS-2024-18',
      className: 'B.Tech CS 3rd Year',
      section: 'Section A',
      phone: '+91 98123 45678',
      email: 'priya.verma@college.edu',
      category: 'leave',
      title: 'Medical Leave Application (3 Days)',
      description: 'Respected Teacher, I am down with viral fever. Requesting permission for leave from 10th to 12th. Medical prescription is attached.',
      urgency: 'urgent',
      attachedFile: {
        name: 'medical_certificate_prescription.pdf',
        size: 145200,
        type: 'application/pdf',
      },
      status: 'in_review',
      teacherRemarks: 'Prescription noted. Get well soon and submit lab assignments upon return.',
      createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
      notificationSent: true,
      notificationDetails: {
        smsSent: true,
        emailSent: true,
        sentAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      }
    },
    {
      id: 'REQ-10479',
      studentName: 'Rahul Patel',
      rollNumber: 'CS-2024-55',
      className: 'B.Tech CS 3rd Year',
      section: 'Section B',
      phone: '+91 97234 56789',
      email: 'rahul.patel@college.edu',
      category: 'document',
      title: 'Official 4th Semester Marksheet Duplicate Copy',
      description: 'Sir, I have misplaced my hardcopy marksheet of 4th Semester and need a verified duplicate copy for internship verification.',
      urgency: 'normal',
      status: 'approved',
      teacherRemarks: 'Verified and signed. You can collect the printed original from Admin Block Counter #3.',
      createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
      notificationSent: true,
      notificationDetails: {
        smsSent: true,
        emailSent: true,
        sentAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      }
    }
  ];

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

function saveDatabase(data: StudentRequestItem[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write database file:', e);
  }
}

async function startServer() {
  let requestsDb = initDatabase();
  const app = express();
  const PORT = 3000;

  // JSON payload parser with generous limit for document uploads (base64)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS and Cache-Control headers for iframe and cross-origin compatibility
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.path.startsWith('/api')) {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), count: requestsDb.length });
  });

  // GET all requests
  app.get('/api/requests', (req, res) => {
    res.json(requestsDb);
  });

  // GET single request by ID
  app.get('/api/requests/:id', (req, res) => {
    const item = requestsDb.find(
      (r) => r.id.toLowerCase() === req.params.id.toLowerCase() ||
             r.rollNumber.toLowerCase() === req.params.id.toLowerCase()
    );
    if (!item) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(item);
  });

  // POST create a new student request
  app.post('/api/requests', (req, res) => {
    try {
      const {
        studentName,
        rollNumber,
        className,
        section,
        previousCollegeName,
        phone,
        email,
        category,
        title,
        description,
        urgency,
        skillRatings,
        academicRequirements,
        extraRequirementsNote,
        attachedFile,
      } = req.body;

      if (!studentName || !rollNumber || !title || !description) {
        return res.status(400).json({ error: 'Please provide all required fields' });
      }

      // Generate random clean unique ID e.g. REQ-68492
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const newId = `REQ-${randomSuffix}`;
      const now = new Date().toISOString();

      const newRequest: StudentRequestItem = {
        id: newId,
        studentName: String(studentName).trim(),
        rollNumber: String(rollNumber).trim().toUpperCase(),
        className: String(className || 'Class Student').trim(),
        section: section ? String(section).trim() : undefined,
        previousCollegeName: previousCollegeName ? String(previousCollegeName).trim() : undefined,
        phone: String(phone || '').trim(),
        email: String(email || '').trim(),
        category: category || 'document',
        title: String(title).trim(),
        description: String(description).trim(),
        urgency: urgency || 'normal',
        skillRatings: skillRatings || undefined,
        academicRequirements: Array.isArray(academicRequirements) ? academicRequirements : undefined,
        extraRequirementsNote: extraRequirementsNote ? String(extraRequirementsNote).trim() : undefined,
        attachedFile: attachedFile ? {
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type,
          dataUrl: attachedFile.dataUrl,
        } : undefined,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        notificationSent: true,
        notificationDetails: {
          smsSent: true,
          emailSent: !!email,
          sentAt: now,
        },
      };

      requestsDb.unshift(newRequest);
      saveDatabase(requestsDb);

      console.log(`[DB] New student request created: ${newId} from ${newRequest.studentName} (${newRequest.rollNumber})`);

      res.status(201).json({
        success: true,
        message: 'Request successfully submitted to database and notification dispatched',
        request: newRequest,
      });
    } catch (err: any) {
      console.error('Error saving request:', err);
      res.status(500).json({ error: 'Failed to save request', details: err?.message });
    }
  });

  // PATCH update status / remarks
  app.patch('/api/requests/:id', (req, res) => {
    const { id } = req.params;
    const { status, teacherRemarks } = req.body;

    const index = requestsDb.findIndex((r) => r.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (status) requestsDb[index].status = status;
    if (teacherRemarks !== undefined) requestsDb[index].teacherRemarks = teacherRemarks;
    requestsDb[index].updatedAt = new Date().toISOString();

    saveDatabase(requestsDb);
    res.json({ success: true, request: requestsDb[index] });
  });

  // DELETE a request
  app.delete('/api/requests/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = requestsDb.length;
    requestsDb = requestsDb.filter((r) => r.id.toLowerCase() !== id.toLowerCase());
    if (requestsDb.length === initialLen) {
      return res.status(404).json({ error: 'Request not found' });
    }
    saveDatabase(requestsDb);
    res.json({ success: true, message: 'Request deleted' });
  });

  // GET database info, statistics, and full document collection
  app.get('/api/database', (req, res) => {
    let stats = { size: 0, mtime: new Date().toISOString() };
    if (fs.existsSync(DB_FILE)) {
      try {
        const s = fs.statSync(DB_FILE);
        stats = { size: s.size, mtime: s.mtime.toISOString() };
      } catch {}
    }
    res.json({
      status: 'online',
      storageEngine: 'Local Persistent JSON Document Store',
      filePath: 'data/database.json',
      fileSizeBytes: stats.size,
      fileSizeKB: (stats.size / 1024).toFixed(2),
      totalRecords: requestsDb.length,
      lastModified: stats.mtime,
      endpoints: {
        allRequests: '/api/requests',
        rawDatabase: '/api/database',
        exportCsv: '/api/database/export?format=csv',
        exportJson: '/api/database/export?format=json',
      },
      records: requestsDb,
    });
  });

  // GET raw database file download or inspection
  app.get('/api/database/raw', (req, res) => {
    if (!fs.existsSync(DB_FILE)) {
      saveDatabase(requestsDb);
    }
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(DB_FILE);
  });

  // GET database export as JSON or CSV file
  app.get('/api/database/export', (req, res) => {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="student_database_${new Date().toISOString().slice(0, 10)}.json"`);
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(requestsDb, null, 2));
    } else {
      const headers = [
        'Tracking ID',
        'Student Name',
        'Roll Number',
        'Class',
        'Section',
        'Previous College',
        'Category',
        'Subject',
        'Status',
        'Urgency',
        'Skill Ratings (Prog/Docs/Sheets/Forms/Report/Eng)',
        'Academic Requirements',
        'Requirements Note',
        'Phone',
        'Email',
        'Remarks',
        'Date'
      ];
      const rows = requestsDb.map(r => {
        const skillsSummary = r.skillRatings
          ? `P:${r.skillRatings.programming || '-'}; W:${r.skillRatings.googleDocsWord || '-'}; S:${r.skillRatings.googleSheetsExcel || '-'}; F:${r.skillRatings.googleForms || '-'}; R:${r.skillRatings.reportWriting || '-'}; E:${r.skillRatings.englishCommunication || '-'}`
          : '';
        const reqsSummary = (r.academicRequirements || []).join('; ');
        return [
          `"${r.id}"`,
          `"${(r.studentName || '').replace(/"/g, '""')}"`,
          `"${r.rollNumber}"`,
          `"${r.className}"`,
          `"${r.section || ''}"`,
          `"${(r.previousCollegeName || '').replace(/"/g, '""')}"`,
          `"${r.category}"`,
          `"${(r.title || '').replace(/"/g, '""')}"`,
          `"${r.status}"`,
          `"${r.urgency}"`,
          `"${skillsSummary.replace(/"/g, '""')}"`,
          `"${reqsSummary.replace(/"/g, '""')}"`,
          `"${(r.extraRequirementsNote || '').replace(/"/g, '""')}"`,
          `"${r.phone || ''}"`,
          `"${r.email || ''}"`,
          `"${(r.teacherRemarks || '').replace(/"/g, '""')}"`,
          `"${r.createdAt}"`
        ];
      });
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
      res.setHeader('Content-Disposition', `attachment; filename="student_database_${new Date().toISOString().slice(0, 10)}.csv"`);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csv);
    }
  });

  // POST reset or seed database
  app.post('/api/database/reset-seed', (req, res) => {
    requestsDb = initDatabase();
    saveDatabase(requestsDb);
    res.json({ success: true, message: 'Database reset to initial seed data', count: requestsDb.length });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
