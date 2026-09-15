import ExcelJS from 'exceljs';
import { StudentRequest } from '../types';

export async function exportStudentDataToExcel(requests: StudentRequest[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'College Student Support Portal';
  workbook.created = new Date();

  // ----------------------------------------------------
  // SHEET 1: 📊 Executive Summary & Analytics
  // ----------------------------------------------------
  const summarySheet = workbook.addWorksheet('📊 Analytics & Summary', {
    views: [{ showGridLines: true }]
  });

  // Set column widths
  summarySheet.columns = [
    { width: 4 },   // A (spacer)
    { width: 34 },  // B (Title/Category)
    { width: 16 },  // C (Beginner / Count)
    { width: 18 },  // D (Intermediate / Pct)
    { width: 16 },  // E (Advanced / Priority)
    { width: 16 },  // F (Total)
    { width: 32 }   // G (Visual Chart Bar)
  ];

  // Header Banner
  summarySheet.mergeCells('B2:G2');
  const mainTitleCell = summarySheet.getCell('B2');
  mainTitleCell.value = 'STUDENT SKILLS & ACADEMIC REQUIREMENTS ANALYSIS REPORT';
  mainTitleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  mainTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' } // Deep Navy
  };
  mainTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(2).height = 36;

  summarySheet.mergeCells('B3:G3');
  const subTitleCell = summarySheet.getCell('B3');
  subTitleCell.value = `Generated Automatically on ${new Date().toLocaleString()} | Total Students Analyzed: ${requests.length}`;
  subTitleCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF1E293B' } };
  subTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(3).height = 22;

  // KPI Block
  summarySheet.getRow(5).height = 28;
  const kpiLabels = [
    { cell: 'B5', val: 'Total Submissions', bg: 'FFEFF6FF', text: 'FF1E40AF' },
    { cell: 'C5', val: String(requests.length), bg: 'FFDBEAFE', text: 'FF1E3A8A', isValue: true },
    { cell: 'D5', val: 'Assessment Status', bg: 'FFF0FDF4', text: 'FF166534' },
    { cell: 'E5', val: '100% Synced', bg: 'FFDCFCE7', text: 'FF14532D', isValue: true },
    { cell: 'F5', val: 'Report Format', bg: 'FFFAF5FF', text: 'FF6B21A8' },
    { cell: 'G5', val: 'Official Auto-Analyzed', bg: 'FFF3E8FF', text: 'FF581C87', isValue: true }
  ];

  kpiLabels.forEach(k => {
    const c = summarySheet.getCell(k.cell);
    c.value = k.val;
    c.font = { name: 'Calibri', size: k.isValue ? 12 : 10, bold: true, color: { argb: k.text } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.bg } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  // ----------------------------------------------------
  // PART 1: Technical Skills Aggregation
  // ----------------------------------------------------
  const skillsList = [
    { key: 'programming', label: '1. Programming Skills' },
    { key: 'googleDocsWord', label: '2. Google Docs & MS Word' },
    { key: 'googleSheetsExcel', label: '3. Google Sheets & MS Excel' },
    { key: 'googleForms', label: '4. Google Forms' },
    { key: 'reportWriting', label: '5. Report Writing Skills' },
    { key: 'englishCommunication', label: '6. English Communication' }
  ] as const;

  let currentRow = 7;
  summarySheet.mergeCells(`B${currentRow}:G${currentRow}`);
  const skillSecTitle = summarySheet.getCell(`B${currentRow}`);
  skillSecTitle.value = 'PART 1: TECHNICAL & SOFTWARE SKILLS SELF-ASSESSMENT DISTRIBUTION';
  skillSecTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  skillSecTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  skillSecTitle.alignment = { vertical: 'middle', indent: 1 };
  summarySheet.getRow(currentRow).height = 24;

  currentRow++;
  const skillHeaders = ['Skill Category', 'Beginner', 'Intermediate', 'Advanced', 'Total Rated', 'Visual Graph / Distribution'];
  const skillColKeys = ['B', 'C', 'D', 'E', 'F', 'G'];
  summarySheet.getRow(currentRow).height = 22;
  skillHeaders.forEach((h, idx) => {
    const c = summarySheet.getCell(`${skillColKeys[idx]}${currentRow}`);
    c.value = h;
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'left' : 'center' };
    c.border = { bottom: { style: 'medium', color: { argb: 'FF94A3B8' } } };
  });

  const generateProgressBar = (begPct: number, interPct: number, advPct: number) => {
    const totalChars = 14;
    const b = Math.round((begPct / 100) * totalChars);
    const i = Math.round((interPct / 100) * totalChars);
    const a = Math.max(0, totalChars - b - i);
    return `[Beg:${begPct}% | Int:${interPct}% | Adv:${advPct}%]`;
  };

  currentRow++;
  skillsList.forEach(s => {
    let beg = 0, inter = 0, adv = 0;
    requests.forEach(r => {
      const val = r.skillRatings?.[s.key];
      if (val === 'Beginner') beg++;
      else if (val === 'Intermediate') inter++;
      else if (val === 'Advanced') adv++;
    });
    const total = beg + inter + adv || 1;
    const begPct = Math.round((beg / total) * 100);
    const interPct = Math.round((inter / total) * 100);
    const advPct = Math.round((adv / total) * 100);

    const row = summarySheet.getRow(currentRow);
    row.height = 20;

    summarySheet.getCell(`B${currentRow}`).value = s.label;
    summarySheet.getCell(`C${currentRow}`).value = `${beg} (${begPct}%)`;
    summarySheet.getCell(`D${currentRow}`).value = `${inter} (${interPct}%)`;
    summarySheet.getCell(`E${currentRow}`).value = `${adv} (${advPct}%)`;
    summarySheet.getCell(`F${currentRow}`).value = total;
    summarySheet.getCell(`G${currentRow}`).value = generateProgressBar(begPct, interPct, advPct);

    // Style numbers
    ['C', 'D', 'E', 'F', 'G'].forEach(col => {
      const c = summarySheet.getCell(`${col}${currentRow}`);
      c.alignment = { vertical: 'middle', horizontal: 'center' };
      c.font = { name: 'Calibri', size: 10 };
    });
    summarySheet.getCell(`B${currentRow}`).font = { name: 'Calibri', size: 10, bold: true };
    summarySheet.getCell(`G${currentRow}`).font = { name: 'Consolas', size: 9, color: { argb: 'FF0F766E' } };

    // Zebra border
    skillColKeys.forEach(col => {
      summarySheet.getCell(`${col}${currentRow}`).border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });

    currentRow++;
  });

  // ----------------------------------------------------
  // PART 2: Academic Requirements Demand Breakdown
  // ----------------------------------------------------
  currentRow++;
  summarySheet.mergeCells(`B${currentRow}:G${currentRow}`);
  const reqSecTitle = summarySheet.getCell(`B${currentRow}`);
  reqSecTitle.value = 'PART 2: PRESENT ACADEMIC REQUIREMENTS & SPECIAL PERIODS DEMAND (RANKED)';
  reqSecTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  reqSecTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } }; // Indigo
  reqSecTitle.alignment = { vertical: 'middle', indent: 1 };
  summarySheet.getRow(currentRow).height = 24;

  currentRow++;
  const reqHeaders = ['Academic Requirement / Subject', 'Student Count', 'Percentage Demand', 'Faculty Priority', 'Total Analyzed', 'Demand Visual Bar'];
  summarySheet.getRow(currentRow).height = 22;
  reqHeaders.forEach((h, idx) => {
    const c = summarySheet.getCell(`${skillColKeys[idx]}${currentRow}`);
    c.value = h;
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'left' : 'center' };
    c.border = { bottom: { style: 'medium', color: { argb: 'FF94A3B8' } } };
  });

  const allRequirements = [
    'Extra Periods / Doubt Classes',
    'Website Design',
    'English Grammar & Communication',
    'Project Work with Report Writing',
    'Interview Preparation',
    'Presentation Slides'
  ];

  const totalStudents = requests.length || 1;
  const reqStats = allRequirements.map(reqName => {
    let count = 0;
    requests.forEach(r => {
      if (r.academicRequirements?.includes(reqName)) count++;
    });
    const pct = Math.round((count / totalStudents) * 100);
    const priority = pct >= 50 ? 'HIGH DEMAND' : pct >= 25 ? 'MODERATE' : 'NORMAL';
    return { reqName, count, pct, priority };
  }).sort((a, b) => b.count - a.count);

  currentRow++;
  reqStats.forEach(item => {
    const barBlocks = Math.round((item.pct / 100) * 15);
    const bar = '█'.repeat(barBlocks) + '░'.repeat(Math.max(0, 15 - barBlocks)) + ` ${item.pct}%`;

    summarySheet.getCell(`B${currentRow}`).value = item.reqName;
    summarySheet.getCell(`C${currentRow}`).value = item.count;
    summarySheet.getCell(`D${currentRow}`).value = `${item.pct}%`;
    summarySheet.getCell(`E${currentRow}`).value = item.priority;
    summarySheet.getCell(`F${currentRow}`).value = requests.length;
    summarySheet.getCell(`G${currentRow}`).value = bar;

    summarySheet.getRow(currentRow).height = 20;

    summarySheet.getCell(`B${currentRow}`).font = { name: 'Calibri', size: 10, bold: true };
    summarySheet.getCell(`C${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getCell(`D${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getCell(`E${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getCell(`F${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getCell(`G${currentRow}`).alignment = { vertical: 'middle', horizontal: 'left' };
    summarySheet.getCell(`G${currentRow}`).font = { name: 'Consolas', size: 9, color: { argb: item.pct >= 50 ? 'FFDC2626' : 'FF2563EB' } };

    // Priority color
    const priCell = summarySheet.getCell(`E${currentRow}`);
    if (item.priority === 'HIGH DEMAND') {
      priCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF991B1B' } };
      priCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    } else if (item.priority === 'MODERATE') {
      priCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF92400E' } };
      priCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    } else {
      priCell.font = { name: 'Calibri', size: 9, color: { argb: 'FF15803D' } };
      priCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
    }

    skillColKeys.forEach(col => {
      summarySheet.getCell(`${col}${currentRow}`).border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });

    currentRow++;
  });

  // ----------------------------------------------------
  // PART 3: Automated Faculty Action Plan & Recommendations
  // ----------------------------------------------------
  currentRow++;
  summarySheet.mergeCells(`B${currentRow}:G${currentRow}`);
  const recTitle = summarySheet.getCell(`B${currentRow}`);
  recTitle.value = 'PART 3: AUTOMATED FACULTY RECOMMENDATIONS & ACTIONABLE NEXT STEPS';
  recTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  recTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } }; // Teal
  recTitle.alignment = { vertical: 'middle', indent: 1 };
  summarySheet.getRow(currentRow).height = 24;

  const recommendations = [
    `1. High Priority Action: Schedule special doubt clearing classes for "${reqStats[0]?.reqName || 'Extra Periods'}" which has the highest demand from ${reqStats[0]?.count || 0} students (${reqStats[0]?.pct || 0}%).`,
    '2. Practical Lab Sessions: Organize foundational computer laboratory sessions for students who assessed themselves as Beginner in Programming and Report Writing.',
    '3. Placements & Soft Skills: Plan targeted mock interviews and communication workshops before the semester placement drive.',
    '4. Note on Phone Numbers: In "📋 Student Data (Master)" sheet, all mobile numbers are stored as clean text to prevent Excel scientific notation.'
  ];

  recommendations.forEach(rec => {
    currentRow++;
    summarySheet.mergeCells(`B${currentRow}:G${currentRow}`);
    const cell = summarySheet.getCell(`B${currentRow}`);
    cell.value = rec;
    cell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF1E293B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.alignment = { vertical: 'middle', indent: 1 };
    summarySheet.getRow(currentRow).height = 22;
  });

  // ----------------------------------------------------
  // SHEET 2: 📋 Student Data (Master Table)
  // ----------------------------------------------------
  const masterSheet = workbook.addWorksheet('📋 Student Data (Master)', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  masterSheet.columns = [
    { header: 'Tracking ID', key: 'id', width: 16 },
    { header: 'Submission Date', key: 'date', width: 20 },
    { header: 'Student Name', key: 'name', width: 22 },
    { header: 'Roll Number', key: 'roll', width: 16 },
    { header: 'Class', key: 'class', width: 18 },
    { header: 'Section', key: 'section', width: 12 },
    { header: 'Previous College Name', key: 'college', width: 28 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Subject / Title', key: 'title', width: 34 },
    { header: 'Description / Reason', key: 'desc', width: 38 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Urgency', key: 'urgency', width: 14 },
    { header: '1. Programming Skills', key: 'p_skill', width: 22 },
    { header: '2. Google Docs & Word', key: 'w_skill', width: 22 },
    { header: '3. Google Sheets & Excel', key: 'e_skill', width: 22 },
    { header: '4. Google Forms', key: 'f_skill', width: 22 },
    { header: '5. Report Writing Skills', key: 'r_skill', width: 22 },
    { header: '6. English Communication', key: 'c_skill', width: 22 },
    { header: '7. Academic Requirements', key: 'requirements', width: 36 },
    { header: 'Requirements Note / Timing', key: 'req_note', width: 30 },
    { header: 'Phone Number (Text Format)', key: 'phone', width: 20 },
    { header: 'Email Address', key: 'email', width: 26 },
    { header: 'Teacher Remarks', key: 'remarks', width: 28 }
  ];

  // Style Header Row
  const headerRow = masterSheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' } // Slate 900
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF3B82F6' } }
    };
  });

  // Add Rows
  requests.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    const reqList = (r.academicRequirements && r.academicRequirements.length > 0)
      ? r.academicRequirements.join('; ')
      : 'None selected';

    // Format phone as clean text string starting with a single quote or clean string to prevent Excel scientific notation
    const cleanPhone = r.phone ? String(r.phone).trim() : '';

    const row = masterSheet.addRow({
      id: r.id,
      date: new Date(r.createdAt).toLocaleString(),
      name: r.studentName,
      roll: r.rollNumber,
      class: r.className,
      section: r.section || '',
      college: r.previousCollegeName || 'N/A',
      category: r.category,
      title: r.title,
      desc: r.description,
      status: r.status.toUpperCase(),
      urgency: r.urgency.toUpperCase(),
      p_skill: r.skillRatings?.programming || 'Not Answered',
      w_skill: r.skillRatings?.googleDocsWord || 'Not Answered',
      e_skill: r.skillRatings?.googleSheetsExcel || 'Not Answered',
      f_skill: r.skillRatings?.googleForms || 'Not Answered',
      r_skill: r.skillRatings?.reportWriting || 'Not Answered',
      c_skill: r.skillRatings?.englishCommunication || 'Not Answered',
      requirements: reqList,
      req_note: r.extraRequirementsNote || '',
      phone: cleanPhone,
      email: r.email || '',
      remarks: r.teacherRemarks || ''
    });

    row.height = 22;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      if (!isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      }

      // Center specific columns
      if ([1, 2, 4, 6, 8, 11, 12, 13, 14, 15, 16, 17, 18, 21].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Explicitly set text format for phone number column so Excel doesn't turn it into 8.096E+11
      if (colNumber === 21) {
        cell.numFmt = '@'; // Text format
      }

      // Status colors
      if (colNumber === 11) {
        if (cell.value === 'APPROVED') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF166534' } };
        } else if (cell.value === 'PENDING') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF854D0E' } };
        } else if (cell.value === 'IN_REVIEW') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1E40AF' } };
        }
      }
    });
  });

  // Enable Auto Filter on Master Sheet
  masterSheet.autoFilter = {
    from: 'A1',
    to: `W${requests.length + 1}`
  };

  // ----------------------------------------------------
  // SHEET 3: 🎯 Subject-wise Student Batches
  // ----------------------------------------------------
  const batchSheet = workbook.addWorksheet('🎯 Subject-wise Batches', {
    views: [{ showGridLines: true }]
  });

  batchSheet.columns = [
    { width: 4 },
    { width: 28 }, // Subject
    { width: 22 }, // Student Name
    { width: 16 }, // Roll Number
    { width: 20 }, // Class
    { width: 18 }, // Phone
    { width: 34 }  // Specific Note
  ];

  let bRow = 2;
  batchSheet.mergeCells(`B${bRow}:G${bRow}`);
  const bTitle = batchSheet.getCell(`B${bRow}`);
  bTitle.value = 'STUDENT BATCHES ORGANIZED BY REQUESTED ACADEMIC REQUIREMENT';
  bTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  bTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  bTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  batchSheet.getRow(bRow).height = 32;

  bRow += 2;

  allRequirements.forEach(reqName => {
    const matchingStudents = requests.filter(r => r.academicRequirements?.includes(reqName));
    if (matchingStudents.length === 0) return;

    // Subject Group Header
    batchSheet.mergeCells(`B${bRow}:G${bRow}`);
    const groupCell = batchSheet.getCell(`B${bRow}`);
    groupCell.value = `📌 ${reqName} (${matchingStudents.length} Students Interested)`;
    groupCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    groupCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    groupCell.alignment = { vertical: 'middle', indent: 1 };
    batchSheet.getRow(bRow).height = 24;
    bRow++;

    // Sub-headers
    const bHeaders = ['Requirement', 'Student Name', 'Roll No', 'Class', 'Phone Number', 'Specific Request / Timings'];
    const bColKeys = ['B', 'C', 'D', 'E', 'F', 'G'];
    batchSheet.getRow(bRow).height = 20;
    bHeaders.forEach((h, idx) => {
      const c = batchSheet.getCell(`${bColKeys[idx]}${bRow}`);
      c.value = h;
      c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      c.alignment = { vertical: 'middle', horizontal: 'center' };
      c.border = { bottom: { style: 'thin', color: { argb: 'FF94A3B8' } } };
    });
    bRow++;

    matchingStudents.forEach(st => {
      batchSheet.getRow(bRow).height = 20;
      batchSheet.getCell(`B${bRow}`).value = reqName;
      batchSheet.getCell(`C${bRow}`).value = st.studentName;
      batchSheet.getCell(`D${bRow}`).value = st.rollNumber;
      batchSheet.getCell(`E${bRow}`).value = st.className;
      batchSheet.getCell(`F${bRow}`).value = st.phone || '';
      batchSheet.getCell(`F${bRow}`).numFmt = '@'; // Force text
      batchSheet.getCell(`G${bRow}`).value = st.extraRequirementsNote || 'Standard curriculum';

      bColKeys.forEach(col => {
        const c = batchSheet.getCell(`${col}${bRow}`);
        c.font = { name: 'Calibri', size: 9 };
        c.alignment = { vertical: 'middle' };
        c.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      });
      batchSheet.getCell(`D${bRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
      batchSheet.getCell(`F${bRow}`).alignment = { vertical: 'middle', horizontal: 'center' };

      bRow++;
    });

    bRow++; // Spacer
  });

  // Write to buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Student_Analysis_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
