/**
 * Utility for parsing Google Drive folder and file names into structured PYQ metadata.
 * Matches official KSLU course structures, subject mappings, schemes, and exam years.
 */

// Canonical course catalog matching KSLU degree programs in DB
// Note: More specific 5-year degrees are evaluated before B.A. LL.B to prevent substring collisions
const KNOWN_COURSES = [
  {
    name: '3-Year LL.B',
    code: '3YR-LLB',
    totalSemesters: 6,
    patterns: [
      /\b3[\s_-]*(?:years?|yrs?)?[\s_-]*ll\.?b\b/i,
      /\b3[\s_-]*ll\.?b\b/i,
      /\b3y[\s_-]*llb\b/i
    ]
  },
  {
    name: '5-Year B.B.A. LL.B',
    code: '5YR-BBALLB',
    totalSemesters: 10,
    patterns: [
      /\bb\.?b\.?a\.?[\s_-]*ll\.?b\b/i,
      /\bbba[\s_-]*ll\.?b\b/i,
      /\b5[\s_-]*(?:years?|yrs?)?[\s_-]*bba[\s_-]*ll\.?b\b/i
    ]
  },
  {
    name: '5-Year B.Com. LL.B',
    code: '5YR-BCOMLLB',
    totalSemesters: 10,
    patterns: [
      /\bb\.?com\.?[\s_-]*ll\.?b\b/i,
      /\bbcom[\s_-]*ll\.?b\b/i,
      /\b5[\s_-]*(?:years?|yrs?)?[\s_-]*bcom[\s_-]*ll\.?b\b/i
    ]
  },
  {
    name: '5-Year B.Sc. LL.B',
    code: '5YR-BSCLB',
    totalSemesters: 10,
    patterns: [
      /\bb\.?sc\.?[\s_-]*ll\.?b\b/i,
      /\bbsc[\s_-]*ll\.?b\b/i,
      /\b5[\s_-]*(?:years?|yrs?)?[\s_-]*bsc[\s_-]*ll\.?b\b/i
    ]
  },
  {
    name: '5-Year B.A. LL.B',
    code: '5YR-BALLB',
    totalSemesters: 10,
    patterns: [
      /\bb\.?a\.?[\s_-]*ll\.?b\b/i,
      /\bba[\s_-]*ll\.?b\b/i,
      /\b5[\s_-]*(?:years?|yrs?)?[\s_-]*ba[\s_-]*ll\.?b\b/i
    ]
  }
];

/**
 * Normalizes Unicode dashes, spaces, and trims input strings
 */
function normalizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, ' ').trim();
}

/**
 * Matches a folder name to a recognized Course.
 * @param {string} folderName
 * @returns {{ name: string, code: string, totalSemesters: number } | null}
 */
function parseCourseFolder(folderName) {
  const trimmed = normalizeString(folderName);
  if (!trimmed) return null;

  for (const course of KNOWN_COURSES) {
    for (const pattern of course.patterns) {
      if (pattern.test(trimmed)) {
        return {
          name: course.name,
          code: course.code,
          totalSemesters: course.totalSemesters
        };
      }
    }
  }

  return null;
}

/**
 * Parses a semester folder name (e.g., "Semester 1", "Sem-2", "Semester 10").
 * @param {string} folderName
 * @param {number} maxSemesters
 * @returns {{ semesterNumber: number, name: string } | null}
 */
function parseSemesterFolder(folderName, maxSemesters = 10) {
  const trimmed = normalizeString(folderName);
  if (!trimmed) return null;

  // Match: "Semester 1", "Sem 1", "Sem-01", "S1", "Semester 10"
  const match = trimmed.match(/(?:sem(?:ester)?|s)\s*[-_]?\s*(\d{1,2})/i);
  if (!match) return null;

  const num = parseInt(match[1], 10);
  if (isNaN(num) || num < 1 || num > maxSemesters) return null;

  return {
    semesterNumber: num,
    name: `Semester ${num}`
  };
}

/**
 * Parses a Scheme folder name.
 * Strictly checks for Scheme 80 Marks or Scheme 100 Marks.
 * @param {string} folderName
 * @returns {{ marks: number, code: string, name: string } | null}
 */
function parseSchemeFolder(folderName) {
  const trimmed = normalizeString(folderName);
  if (!trimmed) return null;

  // Checks for 80 or 100 with optional "scheme" and "marks"
  const match = trimmed.match(/(?:scheme)?\s*(80|100)\s*(?:marks?|m)?/i);
  if (!match) return null;

  const marks = parseInt(match[1], 10);
  if (marks !== 80 && marks !== 100) return null;

  const code = marks === 80 ? '80_MARKS' : '100_MARKS';
  return {
    marks,
    code,
    name: `Scheme ${marks} Marks`
  };
}

/**
 * Normalizes subject names and extracts standard subject codes when identifiable.
 * @param {string} folderName
 * @returns {{ name: string, code: string | null }}
 */
function parseSubjectFolder(folderName) {
  const name = normalizeString(folderName);
  if (!name) return null;

  // Extract explicit subject code in parentheses if present e.g. "Constitutional Law (KSLU-3Y-101)"
  const codeMatch = name.match(/\(([A-Z0-9_\-]+)\)/i);
  const code = codeMatch ? codeMatch[1].toUpperCase() : null;

  // Clean subject name without the trailing code bracket
  let cleanName = name;
  if (codeMatch) {
    cleanName = normalizeString(name.replace(codeMatch[0], ''));
  }

  return {
    name: cleanName || name,
    code
  };
}

const MONTH_SESSIONS = [
  { name: 'January', pattern: /\b(?:jan(?:uary)?)\b/i },
  { name: 'February', pattern: /\b(?:feb(?:ruary)?)\b/i },
  { name: 'March', pattern: /\b(?:mar(?:ch)?)\b/i },
  { name: 'April', pattern: /\b(?:apr(?:il)?)\b/i },
  { name: 'May', pattern: /\bmay\b/i },
  { name: 'June', pattern: /\b(?:jun(?:e)?)\b/i },
  { name: 'July', pattern: /\b(?:jul(?:y)?)\b/i },
  { name: 'August', pattern: /\b(?:aug(?:ust)?)\b/i },
  { name: 'September', pattern: /\b(?:sep(?:t(?:ember)?)?)\b/i },
  { name: 'October', pattern: /\b(?:oct(?:ober)?)\b/i },
  { name: 'November', pattern: /\b(?:nov(?:ember)?)\b/i },
  { name: 'December', pattern: /\b(?:dec(?:ember)?)\b/i }
];

/**
 * Parses a PDF filename to extract examination year, month/session, exam type, and clean title.
 * @param {string} fileName
 * @param {string} [subjectName]
 * @returns {{ title: string, examYear: number | null, examMonth: string, examType: string }}
 */
function parsePdfFileName(fileName, subjectName = '') {
  if (!fileName || typeof fileName !== 'string') {
    return { title: 'Question Paper', examYear: null, examMonth: 'June', examType: 'REGULAR' };
  }

  const baseName = fileName.replace(/\.pdf$/i, '').trim();
  const normalized = normalizeString(baseName.replace(/[_\-]/g, ' '));

  // 1. Detect 4-digit examination year (1990 - 2099)
  let examYear = null;
  const yearMatch = normalized.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    examYear = parseInt(yearMatch[1], 10);
  }

  // 2. Detect month / session
  let examMonth = 'June'; // Default standard semester month if unspecified
  for (const m of MONTH_SESSIONS) {
    if (m.pattern.test(normalized)) {
      examMonth = m.name;
      break;
    }
  }

  // 3. Detect exam type (REGULAR, REVALUATION, SUPPLEMENTARY)
  let examType = 'REGULAR';
  if (/\b(?:suppl(?:ementary)?|repeater)\b/i.test(normalized)) {
    examType = 'SUPPLEMENTARY';
  } else if (/\b(?:reval(?:uation)?|rv)\b/i.test(normalized)) {
    examType = 'REVALUATION';
  }

  // 4. Clean display title
  let displayTitle = baseName;
  if (subjectName) {
    displayTitle = `${subjectName} - ${examMonth} ${examYear || ''}`.trim();
  }

  return {
    title: displayTitle,
    examYear: examYear || new Date().getFullYear(),
    examMonth,
    examType
  };
}

module.exports = {
  KNOWN_COURSES,
  normalizeString,
  parseCourseFolder,
  parseSemesterFolder,
  parseSchemeFolder,
  parseSubjectFolder,
  parsePdfFileName
};
