const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { createSamplePdf } = require('../src/utils/samplePdf');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KSLU Circle database...');

  // Ensure uploads directories exist
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const pyqsDir = path.join(uploadsDir, 'pyqs');
  const notesDir = path.join(uploadsDir, 'notes');
  if (!fs.existsSync(pyqsDir)) fs.mkdirSync(pyqsDir, { recursive: true });
  if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });

  // 1. Schemes
  const scheme80 = await prisma.scheme.upsert({
    where: { code: '80_MARKS' },
    update: {},
    create: {
      code: '80_MARKS',
      name: 'Scheme 80 Marks',
      maxMarks: 80,
      passingMarks: 32,
      description: 'Standard KSLU 80:20 marking pattern (80 marks semester examination + 20 marks internal assessment).'
    }
  });

  const scheme100 = await prisma.scheme.upsert({
    where: { code: '100_MARKS' },
    update: {},
    create: {
      code: '100_MARKS',
      name: 'Scheme 100 Marks',
      maxMarks: 100,
      passingMarks: 40,
      description: 'KSLU 100 marks non-internal examination scheme.'
    }
  });

  console.log('Schemes created.');

  // 2. Courses
  const coursesData = [
    {
      code: '3YR-LLB',
      name: '3-Year LL.B',
      durationYears: 3,
      totalSemesters: 6,
      description: 'Three-Year Bachelor of Laws program for university graduates affiliated with Karnataka State Law University.'
    },
    {
      code: '5YR-BALLB',
      name: '5-Year B.A. LL.B',
      durationYears: 5,
      totalSemesters: 10,
      description: 'Integrated Bachelor of Arts and Bachelor of Laws five-year double-degree program.'
    },
    {
      code: '5YR-BBALLB',
      name: '5-Year B.B.A. LL.B',
      durationYears: 5,
      totalSemesters: 10,
      description: 'Integrated Bachelor of Business Administration and Bachelor of Laws five-year double-degree program.'
    },
    {
      code: '5YR-BCOMLLB',
      name: '5-Year B.Com. LL.B',
      durationYears: 5,
      totalSemesters: 10,
      description: 'Integrated Bachelor of Commerce and Bachelor of Laws five-year program focusing on corporate and commercial jurisprudence.'
    },
    {
      code: '5YR-BSCLB',
      name: '5-Year B.Sc. LL.B',
      durationYears: 5,
      totalSemesters: 10,
      description: 'Integrated Bachelor of Science and Bachelor of Laws five-year program combining scientific analysis with legal studies.'
    }
  ];

  const courseMap = {};
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: c
    });
    courseMap[c.code] = course;
  }
  console.log('Courses created.');

  // 3. Semesters for each course
  const semesterMap = {}; // key: `${courseCode}_${semNumber}`
  for (const [code, course] of Object.entries(courseMap)) {
    for (let sem = 1; sem <= course.totalSemesters; sem++) {
      const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][sem - 1];
      const semester = await prisma.semester.upsert({
        where: {
          courseId_semesterNumber: {
            courseId: course.id,
            semesterNumber: sem
          }
        },
        update: {},
        create: {
          courseId: course.id,
          semesterNumber: sem,
          title: `Semester ${roman}`,
          description: `${course.name} - Semester ${roman} Academic Curriculum`
        }
      });
      semesterMap[`${code}_${sem}`] = semester;
    }
  }
  console.log('Semesters created.');

  // 4. Subjects for 3-Year LL.B
  const llb3Subjects = [
    // Sem 1
    { sem: 1, code: '1011', name: 'Constitutional Law I', isCore: true, credits: 4, desc: 'Preamble, Fundamental Rights, Directive Principles of State Policy, and Fundamental Duties under the Constitution of India.' },
    { sem: 1, code: '1012', name: 'Contract I (General Principles of Contract & Specific Relief Act)', isCore: true, credits: 4, desc: 'Formation of contract, free consent, legality of object, breach, remedies, and the Specific Relief Act, 1963.' },
    { sem: 1, code: '1013', name: 'Law of Torts and Consumer Protection Act', isCore: true, credits: 4, desc: 'General principles of tortious liability, specific torts, strict and absolute liability, vicarious liability, and consumer disputes redressal.' },
    { sem: 1, code: '1014', name: 'Family Law I (Hindu Law)', isCore: true, credits: 4, desc: 'Sources and schools of Hindu law, marriage, divorce, succession, coparcenary, adoption, and maintenance under codified Hindu enactments.' },
    { sem: 1, code: '1015', name: 'Criminal Law I (Indian Penal Code)', isCore: true, credits: 4, desc: 'General principles of liability, mens rea, general exceptions, abetment, conspiracy, offences against state, body, and property.' },

    // Sem 2
    { sem: 2, code: '1021', name: 'Constitutional Law II', isCore: true, credits: 4, desc: 'Union and State Executive, Parliament and State Legislatures, Union Judiciary and High Courts, Center-State relations, and Constitutional amendments.' },
    { sem: 2, code: '1022', name: 'Contract II (Special Contracts)', isCore: true, credits: 4, desc: 'Indemnity and guarantee, bailment and pledge, agency, Indian Partnership Act, 1932, and Sale of Goods Act, 1930.' },
    { sem: 2, code: '1023', name: 'Labour Law I (Industrial Relations & Dispute Resolution)', isCore: true, credits: 4, desc: 'Industrial Disputes Act, 1947, Trade Unions Act, 1926, and standing orders governing employer-employee relations.' },
    { sem: 2, code: '1024', name: 'Family Law II (Mohammedan Law and Indian Succession Act)', isCore: true, credits: 4, desc: 'Muslim personal law, marriage, dower, divorce, gifts (hiba), wills (wasiyat), waqf, and testamentary/intestate succession under Indian Succession Act.' },
    { sem: 2, code: '1025', name: 'Property Law (Transfer of Property Act & Easements)', isCore: true, credits: 4, desc: 'General principles of transfer of property by act of parties, sales, mortgages, leases, exchanges, gifts, and Indian Easements Act.' },

    // Sem 3
    { sem: 3, code: '1031', name: 'Jurisprudence', isCore: true, credits: 4, desc: 'Nature, schools of jurisprudence (Natural, Analytical, Historical, Sociological), theories of justice, sources of law, concepts of rights, duties, ownership, possession, and personality.' },
    { sem: 3, code: '1032', name: 'Labour Law II (Social Security & Minimum Labour Standards)', isCore: true, credits: 4, desc: 'Factories Act, Minimum Wages Act, Employees State Insurance, Workmen Compensation, Maternity Benefit, and Payment of Gratuity.' },
    { sem: 3, code: '1033', name: 'Administrative Law', isCore: true, credits: 4, desc: 'Delegated legislation, principles of natural justice, judicial control of administrative action, writs, ombudsman (Lokpal and Lokayukta), and government liability.' },
    { sem: 3, code: '1034', name: 'Law of Taxation', isCore: true, credits: 4, desc: 'Constitutional basis of taxation, Income Tax Act, 1961, heads of income, deductions, assessment, and Goods and Services Tax (GST) principles.' },
    { sem: 3, code: '1035', name: 'Criminal Law II (Criminal Procedure Code, Probation & Juvenile Justice)', isCore: true, credits: 4, desc: 'Investigation, arrest, bail, trial procedure before magistrates and Sessions Court, appeals, execution, and juvenile delinquency.' },

    // Sem 4
    { sem: 4, code: '1041', name: 'Public International Law and Human Rights', isCore: true, credits: 4, desc: 'Sources of international law, state recognition, territory, jurisdiction, treaties, United Nations charter, and international human rights conventions.' },
    { sem: 4, code: '1042', name: 'Environmental Law', isCore: true, credits: 4, desc: 'Constitutional protection, Water Act, Air Act, Environment Protection Act, 1986, forest conservation, National Green Tribunal, and sustainable development.' },
    { sem: 4, code: '1043', name: 'Company Law', isCore: true, credits: 4, desc: 'Corporate personality, incorporation, memorandum and articles, prospectus, shares, directors, corporate governance, winding up under Companies Act, 2013.' },
    { sem: 4, code: '1044', name: 'Law of Evidence', isCore: true, credits: 4, desc: 'Relevancy of facts, admissions, confessions, dying declarations, burden of proof, estoppel, examination of witnesses, and Indian Evidence Act.' },
    { sem: 4, code: '1045', name: 'Banking Law & Negotiable Instruments', isCore: true, credits: 4, desc: 'Reserve Bank of India Act, Banking Regulation Act, Negotiable Instruments Act, 1881 (cheques, promissory notes, Section 138).' },

    // Sem 5
    { sem: 5, code: '1051', name: 'Civil Procedure Code and Limitation Act', isCore: true, credits: 4, desc: 'Pleadings, jurisdiction, res judicata, suit institution, summons, interim orders, judgments, decrees, execution, appeals, and Limitation Act, 1963.' },
    { sem: 5, code: '1052', name: 'Interpretation of Statutes and Principles of Legislation', isCore: true, credits: 4, desc: 'Primary and secondary rules of statutory interpretation, literal, golden, and mischief rules, internal and external aids, and presumptions.' },
    { sem: 5, code: '1053', name: 'Intellectual Property Rights I (Copyrights & Trademarks)', isCore: true, credits: 4, desc: 'Copyright Act, 1957, Trade Marks Act, 1999, infringement, passing off, fair dealing, and digital copyright issues.' },
    { sem: 5, code: '1054', name: 'Clinical Course I: Alternative Dispute Resolution (ADR)', isCore: true, credits: 4, desc: 'Arbitration and Conciliation Act, 1996, mediation, Lok Adalats under Legal Services Authorities Act, and negotiation simulation.' },

    // Sem 6
    { sem: 6, code: '1061', name: 'Intellectual Property Rights II (Patents & Designs)', isCore: true, credits: 4, desc: 'Patents Act, 1970, patentability requirements, compulsory licensing, patent infringement, and Designs Act, 2000.' },
    { sem: 6, code: '1062', name: 'Clinical Course II: Professional Ethics and Professional Accounting System', isCore: true, credits: 4, desc: 'Advocates Act, 1961, Bar Council of India rules, duties to court, client, and opponent, contempt of court, and accounting for lawyers.' },
    { sem: 6, code: '1063', name: 'Clinical Course III: Drafting, Pleading and Conveyance', isCore: true, credits: 4, desc: 'Practical drafting of civil and criminal pleadings (plaint, written statement, bail application, petitions) and conveyancing deeds (sale deed, mortgage deed, lease, will).' },
    { sem: 6, code: '1064', name: 'Clinical Course IV: Moot Court Exercise and Internship', isCore: true, credits: 4, desc: 'Three practical moot court exercises, memorial preparation, court attendance observation, client interview observation, and internship diary.' }
  ];

  const subjectMap = {};
  for (const s of llb3Subjects) {
    const sem = semesterMap[`3YR-LLB_${s.sem}`];
    const subject = await prisma.subject.upsert({
      where: {
        courseId_semesterId_code: {
          courseId: courseMap['3YR-LLB'].id,
          semesterId: sem.id,
          code: s.code
        }
      },
      update: {},
      create: {
        courseId: courseMap['3YR-LLB'].id,
        semesterId: sem.id,
        code: s.code,
        name: s.name,
        description: s.desc,
        isCore: s.isCore,
        credits: s.credits
      }
    });
    subjectMap[`3YR-LLB_${s.code}`] = subject;
  }

  // Also add key subjects for B.A. LL.B (Sem 1 and 2)
  const ballbSubjects = [
    { sem: 1, code: '2011', name: 'Major Political Science I (Political Theory)', desc: 'State theories, sovereignty, liberty, equality, and constitutional governance.' },
    { sem: 1, code: '2012', name: 'Minor Sociology I (Introduction to Sociology)', desc: 'Social institutions, kinship, stratification, caste, and social change in India.' },
    { sem: 1, code: '2013', name: 'General English & Legal Language', desc: 'Legal terminology, maxims, comprehension, and drafting of legal notices.' },
    { sem: 1, code: '2014', name: 'Law of Torts and Consumer Protection', desc: 'Principles of tort liability and consumer dispute mechanics.' },
    { sem: 2, code: '2021', name: 'Major Political Science II (Foundations of Political Thought)', desc: 'Plato, Aristotle, Machiavelli, Locke, Rousseau, and B.R. Ambedkar.' },
    { sem: 2, code: '2022', name: 'Contract I (General Principles)', desc: 'Indian Contract Act, 1872 and Specific Relief Act.' }
  ];

  for (const s of ballbSubjects) {
    const sem = semesterMap[`5YR-BALLB_${s.sem}`];
    const subject = await prisma.subject.upsert({
      where: {
        courseId_semesterId_code: {
          courseId: courseMap['5YR-BALLB'].id,
          semesterId: sem.id,
          code: s.code
        }
      },
      update: {},
      create: {
        courseId: courseMap['5YR-BALLB'].id,
        semesterId: sem.id,
        code: s.code,
        name: s.name,
        description: s.desc,
        isCore: true,
        credits: 4
      }
    });
    subjectMap[`5YR-BALLB_${s.code}`] = subject;
  }
  console.log('Subjects created.');

  // 5. Users
  const passwordHash = await bcrypt.hash('Kslu@2025!', 10);
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin@2025!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@2025!', 10);
  const studentPasswordHash = await bcrypt.hash('Student@2025!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@kslucircle.org' },
    update: {},
    create: {
      email: 'superadmin@kslucircle.org',
      fullName: 'Chief Administrator (Superadmin)',
      passwordHash: superAdminPasswordHash,
      role: 'SUPERADMIN',
      collegeName: 'Karnataka State Law University Campus, Hubballi',
      isEmailVerified: true
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kslucircle.org' },
    update: {},
    create: {
      email: 'admin@kslucircle.org',
      fullName: 'Academic Moderator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      collegeName: 'University Law College, Bangalore',
      isEmailVerified: true
    }
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@kslucircle.org' },
    update: {},
    create: {
      email: 'student@kslucircle.org',
      fullName: 'Aditya Rao',
      passwordHash: studentPasswordHash,
      role: 'USER',
      collegeName: 'Bangalore Institute of Legal Studies (BILS)',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      isEmailVerified: true
    }
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'priya.sharma@kslucircle.org' },
    update: {},
    create: {
      email: 'priya.sharma@kslucircle.org',
      fullName: 'Priya Sharma',
      passwordHash: studentPasswordHash,
      role: 'USER',
      collegeName: 'Seshadripuram Law College, Bengaluru',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_2'].id,
      isEmailVerified: true
    }
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'rahul.gowda@kslucircle.org' },
    update: {},
    create: {
      email: 'rahul.gowda@kslucircle.org',
      fullName: 'Rahul Gowda',
      passwordHash: studentPasswordHash,
      role: 'USER',
      collegeName: 'Vidyodaya Law College, Tumakuru',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_3'].id,
      isEmailVerified: true
    }
  });
  console.log('Users created.');

  // 6. Generate Sample PDFs on disk
  const samplePdf1 = path.join(pyqsDir, 'pyq-const-law-1-2023.pdf');
  createSamplePdf(
    samplePdf1,
    'KSLU - Constitutional Law I Examination',
    'December 2023 | Scheme 80 Marks | Code: 1011',
    [
      'Time: 3 Hours                                                Max. Marks: 80',
      'Instructions: 1. Answer any FIVE full questions.',
      '              2. One full question from each unit.',
      '--------------------------------------------------------------------------------',
      'UNIT - I',
      'Q1. (a) Discuss the salient features of the Indian Constitution.',
      '    (b) Is Preamble a part of the Constitution? Refer to decided cases.',
      'OR',
      'Q2. (a) Examine the scope and definition of "State" under Article 12.',
      '    (b) Write a note on Doctrine of Severability.',
      '--------------------------------------------------------------------------------',
      'UNIT - II',
      'Q3. (a) "Equality is a dynamic concept with many aspects." Discuss Art. 14.',
      '    (b) Explain the constitutional validity of reservation under Article 16(4).'
    ]
  );

  const samplePdf2 = path.join(pyqsDir, 'pyq-torts-2023.pdf');
  createSamplePdf(
    samplePdf2,
    'KSLU - Law of Torts Examination',
    'June 2023 | Scheme 80 Marks | Code: 1013',
    [
      'Time: 3 Hours                                                Max. Marks: 80',
      '--------------------------------------------------------------------------------',
      'UNIT - I',
      'Q1. (a) Define Tort and distinguish it from Crime and Breach of Contract.',
      '    (b) Explain Damnum Sine Injuria and Injuria Sine Damno with case law.',
      '--------------------------------------------------------------------------------',
      'UNIT - II',
      'Q2. (a) Explain the Rule of Strict Liability laid down in Rylands v. Fletcher.',
      '    (b) How does Absolute Liability differ from Strict Liability in India?'
    ]
  );

  const samplePdf3 = path.join(pyqsDir, 'pyq-ipc-2022.pdf');
  createSamplePdf(
    samplePdf3,
    'KSLU - Criminal Law I (IPC) Examination',
    'December 2022 | Scheme 100 Marks | Code: 1015',
    [
      'Time: 3 Hours                                                Max. Marks: 100',
      '--------------------------------------------------------------------------------',
      'Q1. Discuss the doctrine of Mens Rea under Indian criminal jurisprudence.',
      'Q2. Explain the General Exceptions relating to Private Defence (Sec. 96-106).',
      'Q3. Distinguish between Culpable Homicide and Murder with landmark cases.'
    ]
  );

  const sampleNotePdf1 = path.join(notesDir, 'notes-const-law-art-21.pdf');
  createSamplePdf(
    sampleNotePdf1,
    'Comprehensive Study Notes: Article 21 & Due Process',
    'Constitutional Law I | Compiled by BILS Academic Study Group',
    [
      'TOPIC: RIGHT TO LIFE AND PERSONAL LIBERTY (ARTICLE 21)',
      '1. INTRODUCTION:',
      'Article 21 guarantees: "No person shall be deprived of his life or personal liberty',
      'except according to procedure established by law."',
      '2. EVOLUTION OF PROCEDURE ESTABLISHED BY LAW:',
      '- A.K. Gopalan v. State of Madras (1950): Narrow, literal interpretation.',
      '- Maneka Gandhi v. Union of India (1978): Watershed moment establishing "Due Process".',
      'Procedure must be just, fair, and reasonable, not arbitrary or oppressive.',
      '3. EXPANDED FACETS OF ARTICLE 21:',
      '- Right to clean environment (M.C. Mehta cases)',
      '- Right to privacy as fundamental right (K.S. Puttaswamy case, 2017)',
      '- Right to speedy trial and legal aid (Hussainara Khatoon)',
      '4. EXAM ANSWER WRITING TIP:',
      'Always start with the constitutional text, trace the judicial paradigm shift from',
      'Gopalan to Maneka Gandhi, and conclude with modern digital privacy rights.'
    ]
  );

  const sampleNotePdf2 = path.join(notesDir, 'notes-torts-strict-liability.pdf');
  createSamplePdf(
    sampleNotePdf2,
    'Concept Note: Strict Liability vs Absolute Liability',
    'Law of Torts | Karnataka State Law University Curriculum',
    [
      'RULE OF STRICT LIABILITY (Rylands v. Fletcher, 1868):',
      'Essentials: 1. Bringing onto land something likely to do mischief if it escapes.',
      '            2. Non-natural use of land.',
      '            3. Escape of the dangerous substance.',
      'Exceptions: Act of God, Plaintiff consent, Statutory authority, Act of stranger.',
      'RULE OF ABSOLUTE LIABILITY (M.C. Mehta v. Union of India, 1987):',
      'Introduced by Justice P.N. Bhagwati post Bhopal Gas Leak tragedy.',
      'Applicable to hazardous or inherently dangerous industrial enterprises.',
      'No exceptions allowed! Liability is strict, absolute, and non-delegable.'
    ]
  );

  console.log('Sample PDFs generated on disk.');

  // 7. Seed Question Papers (PYQs)
  const constLawSub = subjectMap['3YR-LLB_1011'];
  const tortsSub = subjectMap['3YR-LLB_1013'];
  const ipcSub = subjectMap['3YR-LLB_1015'];
  const contract1Sub = subjectMap['3YR-LLB_1012'];
  const jurisprudenceSub = subjectMap['3YR-LLB_1031'];

  const pyq1 = await prisma.questionPaper.create({
    data: {
      title: 'Constitutional Law I - December 2023 (Regular)',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: constLawSub.id,
      schemeId: scheme80.id,
      examYear: 2023,
      examMonth: 'December',
      examType: 'REGULAR',
      fileUrl: '/uploads/pyqs/pyq-const-law-1-2023.pdf',
      fileSize: fs.statSync(samplePdf1).size,
      totalPages: 1,
      downloadCount: 142,
      viewCount: 388,
      uploadedById: admin.id,
      isVerified: true
    }
  });

  const pyq2 = await prisma.questionPaper.create({
    data: {
      title: 'Law of Torts and Consumer Protection - June 2023',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: tortsSub.id,
      schemeId: scheme80.id,
      examYear: 2023,
      examMonth: 'June',
      examType: 'REGULAR',
      fileUrl: '/uploads/pyqs/pyq-torts-2023.pdf',
      fileSize: fs.statSync(samplePdf2).size,
      totalPages: 1,
      downloadCount: 95,
      viewCount: 240,
      uploadedById: admin.id,
      isVerified: true
    }
  });

  const pyq3 = await prisma.questionPaper.create({
    data: {
      title: 'Criminal Law I (IPC) - December 2022',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: ipcSub.id,
      schemeId: scheme100.id,
      examYear: 2022,
      examMonth: 'December',
      examType: 'REGULAR',
      fileUrl: '/uploads/pyqs/pyq-ipc-2022.pdf',
      fileSize: fs.statSync(samplePdf3).size,
      totalPages: 1,
      downloadCount: 215,
      viewCount: 512,
      uploadedById: superAdmin.id,
      isVerified: true
    }
  });
  console.log('PYQs created.');

  // 8. Seed Study Materials (Notes)
  const note1 = await prisma.studyMaterial.create({
    data: {
      title: 'Article 21 & Evolution of Due Process (Comprehensive Notes)',
      description: 'Handwritten typed synthesis tracing A.K. Gopalan to Maneka Gandhi and modern Puttaswamy privacy jurisprudence. Includes model 16-mark answer structure.',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: constLawSub.id,
      schemeId: scheme80.id,
      tags: 'Constitutional Law, Article 21, Due Process, Fundamental Rights, Case Laws',
      fileUrl: '/uploads/notes/notes-const-law-art-21.pdf',
      fileSize: fs.statSync(sampleNotePdf1).size,
      totalPages: 1,
      status: 'APPROVED',
      approvedById: admin.id,
      approvedAt: new Date(),
      downloadCount: 88,
      upvotesCount: 34,
      downvotesCount: 1,
      uploadedById: studentUser.id
    }
  });

  const note2 = await prisma.studyMaterial.create({
    data: {
      title: 'Strict Liability vs Absolute Liability Quick Revision Chart',
      description: 'Clear comparative breakdown between Rylands v. Fletcher and M.C. Mehta with key Indian Supreme Court precedents.',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: tortsSub.id,
      schemeId: scheme80.id,
      tags: 'Torts, Strict Liability, Absolute Liability, Rylands v Fletcher, MC Mehta',
      fileUrl: '/uploads/notes/notes-torts-strict-liability.pdf',
      fileSize: fs.statSync(sampleNotePdf2).size,
      totalPages: 1,
      status: 'APPROVED',
      approvedById: admin.id,
      approvedAt: new Date(),
      downloadCount: 62,
      upvotesCount: 19,
      downvotesCount: 0,
      uploadedById: student2.id
    }
  });

  // Pending submission for moderation testing
  const note3 = await prisma.studyMaterial.create({
    data: {
      title: 'General Exceptions in IPC (Sections 76 to 106) Notes',
      description: 'Complete student compilation on mistake of fact, judicial acts, accident, necessity, insanity, intoxication, and right of private defense.',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: ipcSub.id,
      schemeId: scheme80.id,
      tags: 'IPC, General Exceptions, Private Defence, Insanity, Criminal Law',
      fileUrl: '/uploads/notes/notes-const-law-art-21.pdf',
      fileSize: fs.statSync(sampleNotePdf1).size,
      totalPages: 1,
      status: 'PENDING',
      uploadedById: student3.id
    }
  });
  console.log('Study notes created.');

  // 9. Bookmarks & Votes
  await prisma.bookmark.create({
    data: {
      userId: studentUser.id,
      itemType: 'PYQ',
      questionPaperId: pyq1.id
    }
  });

  await prisma.bookmark.create({
    data: {
      userId: studentUser.id,
      itemType: 'STUDY_MATERIAL',
      studyMaterialId: note2.id
    }
  });

  await prisma.vote.create({
    data: {
      userId: studentUser.id,
      studyMaterialId: note2.id,
      voteType: 'UPVOTE'
    }
  });

  // 10. Announcements
  await prisma.announcement.create({
    data: {
      title: 'KSLU Odd Semester Examination Schedule Announced for Jan-Feb 2026',
      slug: 'kslu-odd-sem-exam-schedule-jan-feb-2026',
      content: 'Karnataka State Law University (KSLU) has officially notified the timetable for Odd Semester Examinations (Semesters I, III, V for 3-Year LL.B and I, III, V, VII, IX for 5-Year Integrated Law courses). Practical clinical exams commence from 15th January, followed by theory examinations. Candidates can review detailed circulars on the university website.',
      category: 'EXAMINATION',
      isImportant: true,
      officialSourceUrl: 'https://kslu.karnataka.gov.in/notifications',
      authorId: admin.id,
      publishedAt: new Date()
    }
  });

  await prisma.announcement.create({
    data: {
      title: 'Revaluation and Challenge Valuation Application Window for Even Semesters',
      slug: 'revaluation-challenge-valuation-window-even-sem',
      content: 'Students seeking photocopy, revaluation, or challenge valuation of evaluated answer scripts for the previous Even Semester examinations may submit applications through their respective affiliated law college principals within 15 working days from publication.',
      category: 'RESULTS',
      isImportant: false,
      officialSourceUrl: 'https://kslu.karnataka.gov.in/results',
      authorId: superAdmin.id,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.announcement.create({
    data: {
      title: '14th All India National Moot Court Competition Hubballi',
      slug: '14th-all-india-national-moot-court-hubballi',
      content: 'Registration is now open for the 14th National Moot Court Competition hosted at the University Law School Campus, KSLU, Hubballi. The moot problem centers around Artificial Intelligence, Data Privacy, and Article 21 constitutional challenges.',
      category: 'COMPETITION',
      isImportant: true,
      officialSourceUrl: 'https://kslu.karnataka.gov.in/events',
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });
  console.log('Announcements created.');

  // 11. Career Opportunities
  await prisma.careerOpportunity.create({
    data: {
      title: 'High Court of Karnataka - Judicial Research Clerkship',
      organization: 'High Court of Karnataka, Principal Bench Bengaluru',
      opportunityType: 'INTERNSHIP',
      location: 'Bengaluru, Karnataka',
      stipend: '₹25,000 / month',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      applyUrl: 'https://karnatakajudiciary.kar.nic.in/recruitment',
      contactEmail: 'clerkship@karnatakajudiciary.gov.in',
      description: 'Prestigious research clerkship supporting Hon\'ble Judges in case law research, drafting bench memos, judgment preparation, and comparative legal analysis.',
      eligibility: 'Final year law students or fresh law graduates with minimum 60% aggregate marks.',
      isFeatured: true,
      createdById: admin.id
    }
  });

  await prisma.careerOpportunity.create({
    data: {
      title: 'Corporate Legal Intern - Trilegal Bengaluru',
      organization: 'Trilegal India Law Practice',
      opportunityType: 'INTERNSHIP',
      location: 'Bengaluru, Karnataka',
      stipend: '₹15,000 / month',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      applyUrl: 'https://trilegal.com/careers/internships',
      contactEmail: 'internships.blr@trilegal.com',
      description: 'Hands-on exposure to M&A, general corporate advisory, contract diligence, and regulatory compliance under senior partners.',
      eligibility: 'Penultimate and final year LL.B / B.A. LL.B students with strong foundation in Company Law and Contract Law.',
      isFeatured: true,
      createdById: superAdmin.id
    }
  });

  await prisma.careerOpportunity.create({
    data: {
      title: 'National Law School Environmental Law Research Fellowship',
      organization: 'Center for Environmental Law, NLSIU Bengaluru',
      opportunityType: 'RESEARCH',
      location: 'Bengaluru, Karnataka (Hybrid)',
      stipend: '₹12,000 / month',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      applyUrl: 'https://nls.ac.in/research/fellowships',
      description: 'Engage in statutory policy research on National Green Tribunal judgments, forest conservation, and environmental jurisprudence in South India.',
      eligibility: 'Open to law students in 2nd year and above.',
      isFeatured: false,
      createdById: admin.id
    }
  });
  console.log('Career opportunities created.');

  // 12. Community Discussions & Comments
  const disc1 = await prisma.discussion.create({
    data: {
      title: 'How to structure a high-scoring 16-mark answer for Constitutional Law (Article 21)?',
      content: 'In KSLU Scheme 80 marks, the constitutional law evaluators look for specific elements. What is the most recommended sequence: starting with historical context, case laws, or constitutional provisions?',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: constLawSub.id,
      authorId: studentUser.id,
      upvotesCount: 14,
      viewsCount: 165,
      isSolved: true
    }
  });

  await prisma.comment.create({
    data: {
      discussionId: disc1.id,
      authorId: student2.id,
      content: 'Here is what worked for me to secure an A-grade in Scheme 80: 1. Start with bare text of Art. 21. 2. Contrast A.K. Gopalan (procedure established by law) with Maneka Gandhi (due process). 3. Tabulate at least 5 expanded facets (privacy, environment, speedy trial, legal aid). 4. Conclude with Puttaswamy three-fold proportionality test (Legitimacy, Suitability, Necessity, Proportionality).',
      upvotesCount: 9,
      isAcceptedAnswer: true
    }
  });

  const disc2 = await prisma.discussion.create({
    data: {
      title: 'Crucial distinction: Damnum Sine Injuria vs Injuria Sine Damno',
      content: 'Can someone explain with Gloucester Grammar School case vs Ashby v. White? Often asked as an 8-mark or 16-mark question.',
      courseId: courseMap['3YR-LLB'].id,
      semesterId: semesterMap['3YR-LLB_1'].id,
      subjectId: tortsSub.id,
      authorId: student3.id,
      upvotesCount: 8,
      viewsCount: 92
    }
  });

  await prisma.comment.create({
    data: {
      discussionId: disc2.id,
      authorId: admin.id,
      content: 'Remember the Latin roots: "Damnum" = actual physical/monetary damage; "Injuria" = legal injury (infringement of legal right); "Sine" = without.\n- Damnum Sine Injuria: Damage without legal injury (e.g., Gloucester Grammar - opening competing school causes financial loss but violates no legal right; not actionable).\n- Injuria Sine Damno: Legal injury without actual physical loss (e.g., Ashby v. White - qualified voter wrongfully stopped from voting; candidate won anyway, but legal right was breached; actionable per se).',
      upvotesCount: 15,
      isAcceptedAnswer: true
    }
  });
  console.log('Community discussions created.');

  // 13. Notifications for studentUser
  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Welcome to KSLU Circle!',
      message: 'Explore your Semester I previous year question papers, notes, and connect with fellow law students.',
      type: 'SYSTEM',
      linkUrl: '/pyqs',
      isRead: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Notes Approved: Article 21 & Due Process',
      message: 'Your uploaded notes have been verified by moderator and published to the academic library.',
      type: 'APPROVAL',
      linkUrl: `/notes/${note1.id}`,
      isRead: false
    }
  });

  // 14. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_INITIALIZATION',
      resourceType: 'System',
      details: JSON.stringify({ message: 'KSLU Circle initial database seed completed.' })
    }
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
