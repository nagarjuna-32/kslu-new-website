const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Running KSLU Circle production database initialization...');

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const pyqsDir = path.join(uploadsDir, 'pyqs');
  const notesDir = path.join(uploadsDir, 'notes');
  if (!fs.existsSync(pyqsDir)) fs.mkdirSync(pyqsDir, { recursive: true });
  if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });

  // 1. Official Marking Schemes
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

  console.log('✓ Verified marking schemes initialized.');

  // 2. Official Law Courses
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
  console.log('✓ Verified 5 KSLU degree programs initialized.');

  // 3. Semesters for each course
  const semesterMap = {};
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
  console.log('✓ Verified 46 semester levels initialized.');

  // 4. Official Subjects for 3-Year LL.B
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

  for (const s of llb3Subjects) {
    const sem = semesterMap[`3YR-LLB_${s.sem}`];
    await prisma.subject.upsert({
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
  }

  // Official Key Subjects for B.A. LL.B
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
    await prisma.subject.upsert({
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
  }
  console.log('✓ Verified official subjects and curriculum details initialized.');

  // 5. Production Superadmin Initialization (Only if specified via environment)
  const initialAdminEmail = process.env.INITIAL_SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const initialAdminPass = process.env.INITIAL_SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (initialAdminEmail && initialAdminPass) {
    const hash = await bcrypt.hash(initialAdminPass, 10);
    const superAdmin = await prisma.user.upsert({
      where: { email: initialAdminEmail },
      update: {
        passwordHash: hash,
        role: 'SUPERADMIN',
        isEmailVerified: true
      },
      create: {
        email: initialAdminEmail,
        fullName: 'Chief Administrator',
        passwordHash: hash,
        role: 'SUPERADMIN',
        collegeName: 'Karnataka State Law University Campus',
        isEmailVerified: true
      }
    });
    console.log(`✓ Production Superadmin configured: ${superAdmin.email}`);
  } else {
    console.log('ℹ No INITIAL_SUPERADMIN_EMAIL configured. To provision an administrator, run:');
    console.log('  node scripts/create-admin.js <email> <password>');
  }

  console.log('\nProduction database initialization completed successfully with 0 demo resources.');
}

main()
  .catch((e) => {
    console.error('Initialization error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
