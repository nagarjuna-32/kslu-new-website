const prisma = require('../backend/src/config/db');

async function seed() {
  console.log('--- Seeding Official KSLU Integrated Law Subjects ---');

  const ballb = await prisma.course.findUnique({ where: { code: '5YR-BALLB' } });
  const bballb = await prisma.course.findUnique({ where: { code: '5YR-BBALLB' } });

  if (!ballb || !bballb) {
    throw new Error('5YR-BALLB or 5YR-BBALLB course not found in database.');
  }

  // Fetch all semesters for these courses
  const ballbSemesters = await prisma.semester.findMany({ where: { courseId: ballb.id } });
  const bballbSemesters = await prisma.semester.findMany({ where: { courseId: bballb.id } });

  const ballbSemMap = {};
  ballbSemesters.forEach(s => { ballbSemMap[s.semesterNumber] = s.id; });

  const bballbSemMap = {};
  bballbSemesters.forEach(s => { bballbSemMap[s.semesterNumber] = s.id; });

  const ballbSubjects = [
    // Sem 1
    { sem: 1, code: '2011', name: 'Major Political Science I (Political Theory)', desc: 'State theories, sovereignty, liberty, equality, and constitutional governance.' },
    { sem: 1, code: '2012', name: 'Minor Sociology I (Introduction to Sociology)', desc: 'Social institutions, kinship, stratification, caste, and social change in India.' },
    { sem: 1, code: '2013', name: 'General English & Legal Language', desc: 'Legal terminology, maxims, comprehension, and drafting of legal notices.' },
    { sem: 1, code: '2014', name: 'Law of Torts and Consumer Protection', desc: 'Principles of tort liability and consumer dispute mechanics.' },

    // Sem 2
    { sem: 2, code: '2021', name: 'Major Political Science II (Foundations of Political Thought)', desc: 'Plato, Aristotle, Machiavelli, Locke, Rousseau, and B.R. Ambedkar.' },
    { sem: 2, code: '2022', name: 'Minor Sociology II (Indian Social Problems)', desc: 'Poverty, regionalism, communalism, caste conflicts, and gender justice.' },
    { sem: 2, code: '2023', name: 'English II & Legal Comprehension', desc: 'Advanced legal synthesis, case briefing, and oral advocacy skills.' },
    { sem: 2, code: '2024', name: 'Contract I (General Principles)', desc: 'Indian Contract Act, 1872 and Specific Relief Act.' },

    // Sem 3
    { sem: 3, code: '2031', name: 'Major Political Science III (Indian Constitution & Political Processes)', desc: 'Federalism, election processes, party dynamics, and judicial review in India.' },
    { sem: 3, code: '2032', name: 'Minor Economics I (Principles of Economics)', desc: 'Micro and macroeconomics principles applicable to legal systems.' },
    { sem: 3, code: '2033', name: 'Contract II (Special Contracts)', desc: 'Indemnity, guarantee, bailment, pledge, agency, sale of goods, and partnership.' },
    { sem: 3, code: '2034', name: 'Family Law I (Hindu Law)', desc: 'Hindu Marriage Act, Succession Act, Minority and Guardianship, and Adoption and Maintenance.' },

    // Sem 4
    { sem: 4, code: '2041', name: 'Major Political Science IV (Public Administration)', desc: 'Administrative machinery, civil service ethics, bureaucratic accountability, and public policy.' },
    { sem: 4, code: '2042', name: 'Minor Economics II (Money, Banking & Public Finance)', desc: 'Fiscal policy, monetary economics, tax structures, and public expenditure.' },
    { sem: 4, code: '2043', name: 'Constitutional Law I', desc: 'Fundamental rights, directive principles, and constitutional remedies under Indian Constitution.' },
    { sem: 4, code: '2044', name: 'Family Law II (Mohammedan Law & Indian Succession)', desc: 'Muslim law, waqf, gifts, wills, and succession under the Indian Succession Act.' },

    // Sem 5
    { sem: 5, code: '2051', name: 'Major Political Science V (International Relations & Organisations)', desc: 'Diplomacy, United Nations, global security, international politics, and regional coalitions.' },
    { sem: 5, code: '2052', name: 'Constitutional Law II', desc: 'Executive, Parliament, judiciary, federal relations, emergency provisions, and amendments.' },
    { sem: 5, code: '2053', name: 'Labour Law I (Industrial Relations)', desc: 'Industrial Disputes Act, Trade Unions Act, standing orders, and strikes/lockouts.' },
    { sem: 5, code: '2054', name: 'Criminal Law I (Indian Penal Code)', desc: 'General principles of criminal liability, mens rea, exceptions, and offences.' },

    // Sem 6
    { sem: 6, code: '2061', name: 'Major Political Science VI (Comparative Constitutions & Politics)', desc: 'Constitutional systems of USA, UK, Switzerland, France, and Canada.' },
    { sem: 6, code: '2062', name: 'Labour Law II (Social Security Laws)', desc: 'Factories Act, Minimum Wages, Workmen Compensation, and Maternity Benefits.' },
    { sem: 6, code: '2063', name: 'Jurisprudence', desc: 'Legal philosophy, schools of jurisprudence, sources of law, rights, duties, and personality.' },
    { sem: 6, code: '2064', name: 'Property Law & Easements', desc: 'Transfer of Property Act, 1882 and Indian Easements Act, 1882.' },

    // Sem 7
    { sem: 7, code: '2071', name: 'Public International Law & Human Rights', desc: 'International law sources, state recognition, treaties, and UDHR conventions.' },
    { sem: 7, code: '2072', name: 'Administrative Law', desc: 'Delegated legislation, natural justice, writs, ombudsman, and administrative tribunals.' },
    { sem: 7, code: '2073', name: 'Company Law', desc: 'Corporate personality, incorporation, directors, shares, dividends, and winding up.' },
    { sem: 7, code: '2074', name: 'Criminal Law II (CrPC, Juvenile Justice & Probation)', desc: 'Police investigation, arrest, bail, trial procedure, appeals, and probation.' },

    // Sem 8
    { sem: 8, code: '2081', name: 'Civil Procedure Code and Limitation Act', desc: 'Pleadings, jurisdiction, res judicata, injunctions, appeals, execution, and limitation.' },
    { sem: 8, code: '2082', name: 'Law of Evidence', desc: 'Relevancy, admissions, confessions, burden of proof, estoppel, and witness examination.' },
    { sem: 8, code: '2083', name: 'Law of Taxation', desc: 'Income Tax Act, 1961, heads of income, GST framework, and tax assessment.' },
    { sem: 8, code: '2084', name: 'Environmental Law', desc: 'Environment Protection Act, Water Act, Air Act, NGT, and forest protection.' },

    // Sem 9
    { sem: 9, code: '2091', name: 'Interpretation of Statutes & Principles of Legislation', desc: 'Rules of statutory interpretation, literal, golden, mischief, and internal/external aids.' },
    { sem: 9, code: '2092', name: 'Intellectual Property Rights I (Copyrights & Trademarks)', desc: 'Copyright Act, 1957 and Trade Marks Act, 1999.' },
    { sem: 9, code: '2093', name: 'Banking Law & Negotiable Instruments', desc: 'Banking regulation, RBI Act, and Negotiable Instruments Act Section 138.' },
    { sem: 9, code: '2094', name: 'Clinical Course I: Alternative Dispute Resolution (ADR)', desc: 'Arbitration, conciliation, mediation, and Lok Adalat simulation.' },

    // Sem 10 (TEST 3)
    { sem: 10, code: '2101', name: 'Clinical Course II: Professional Ethics and Professional Accounting System', desc: 'Advocates Act, BCI rules, contempt of court, bar-bench relations, and legal accounting.' },
    { sem: 10, code: '2102', name: 'Clinical Course III: Drafting, Pleading and Conveyance', desc: 'Practical drafting of civil plaints, criminal complaints, bail petitions, and commercial deeds.' },
    { sem: 10, code: '2103', name: 'Clinical Course IV: Moot Court Exercise and Internship', desc: 'Three moot court memorials, court trial observation, client interviewing, and internship diary.' },
    { sem: 10, code: '2104', name: 'Intellectual Property Rights II (Patents & Designs)', desc: 'Patents Act, 1970, patentability, compulsory licensing, and Designs Act, 2000.' }
  ];

  for (const s of ballbSubjects) {
    const semId = ballbSemMap[s.sem];
    if (!semId) continue;
    await prisma.subject.upsert({
      where: {
        courseId_semesterId_code: {
          courseId: ballb.id,
          semesterId: semId,
          code: s.code
        }
      },
      update: {
        name: s.name,
        description: s.desc
      },
      create: {
        courseId: ballb.id,
        semesterId: semId,
        code: s.code,
        name: s.name,
        description: s.desc,
        isCore: true,
        credits: 4
      }
    });
  }
  console.log(`✓ 5-Year B.A. LL.B subjects seeded (${ballbSubjects.length} subjects).`);

  const bballbSubjects = [
    // Sem 1
    { sem: 1, code: '3011', name: 'Principles and Practice of Management', desc: 'Managerial functions, planning, organizing, staffing, directing, and controlling in enterprise governance.' },
    { sem: 1, code: '3012', name: 'Business Economics & Environment', desc: 'Economic theories of demand, production, pricing, market structures, and national income.' },
    { sem: 1, code: '3013', name: 'General English & Legal Language', desc: 'Legal terminology, maxims, comprehension, and drafting of formal business-legal correspondence.' },
    { sem: 1, code: '3014', name: 'Law of Torts and Consumer Protection Act', desc: 'General principles of tortious liability, consumer dispute redressal councils, and product liability.' },

    // Sem 2
    { sem: 2, code: '3021', name: 'Financial Accounting for Managers', desc: 'Accounting standards, ledger management, balance sheet preparation, cash flow statements, and auditing.' },
    { sem: 2, code: '3022', name: 'Organizational Behaviour & Dynamics', desc: 'Individual and group behavior, leadership, organizational culture, motivation, and conflict resolution.' },
    { sem: 2, code: '3023', name: 'English II & Legal Comprehension', desc: 'Legal reasoning, case commentary, statutory comprehension, and professional advocacy articulation.' },
    { sem: 2, code: '3024', name: 'Contract I (General Principles & Specific Relief Act)', desc: 'Formation, validity, discharge, remedies for breach, and Specific Relief Act, 1963.' },

    // Sem 3
    { sem: 3, code: '3031', name: 'Marketing Management', desc: 'Marketing mix, product lifecycle, market segmentation, brand equity, consumer behavior, and sales strategies.' },
    { sem: 3, code: '3032', name: 'Business Statistics & Analytics', desc: 'Measures of central tendency, probability, regression analysis, hypothesis testing, and quantitative decision making.' },
    { sem: 3, code: '3033', name: 'Contract II (Special Contracts)', desc: 'Indemnity, guarantee, bailment, pledge, agency, Indian Partnership Act, and Sale of Goods Act.' },
    { sem: 3, code: '3034', name: 'Family Law I (Hindu Law)', desc: 'Hindu Marriage Act, Succession Act, Minority and Guardianship Act, and Hindu Adoption and Maintenance.' },

    // Sem 4
    { sem: 4, code: '3041', name: 'Financial Management', desc: 'Capital budgeting, cost of capital, capital structure, working capital management, and dividend decisions.' },
    { sem: 4, code: '3042', name: 'Human Resource Management', desc: 'Recruitment, employee training, performance appraisal, compensation management, and industrial relations.' },
    { sem: 4, code: '3043', name: 'Constitutional Law I', desc: 'Preamble, Fundamental Rights, Directive Principles of State Policy, and Constitutional Remedies under Art 32 & 226.' },
    { sem: 4, code: '3044', name: 'Family Law II (Mohammedan Law & Indian Succession)', desc: 'Muslim personal law, marriage, dower, talaq, waqf, wills, and Indian Succession Act provisions.' },

    // Sem 5
    { sem: 5, code: '3051', name: 'International Business Management', desc: 'Global trade environment, WTO, multinational corporations, cross-border mergers, and international finance.' },
    { sem: 5, code: '3052', name: 'Constitutional Law II', desc: 'Union and State Executive, Legislature, Supreme Court, High Courts, Center-State relations, and Amendments.' },
    { sem: 5, code: '3053', name: 'Labour Law I (Industrial Relations)', desc: 'Industrial Disputes Act, 1947, Trade Unions Act, 1926, and industrial employment standing orders.' },
    { sem: 5, code: '3054', name: 'Criminal Law I (Indian Penal Code)', desc: 'General principles of liability, mens rea, exceptions, abetment, and offences against persons and property.' },

    // Sem 6
    { sem: 6, code: '3061', name: 'Total Quality Management & Corporate Governance', desc: 'Quality assurance systems, corporate governance ethics, board responsibilities, and stakeholder protection.' },
    { sem: 6, code: '3062', name: 'Labour Law II (Social Security Laws)', desc: 'Factories Act, Minimum Wages, Employees Compensation Act, and Maternity Benefit Act.' },
    { sem: 6, code: '3063', name: 'Jurisprudence', desc: 'Schools of jurisprudence, theories of justice, sources of law, rights, duties, possession, and corporate personality.' },
    { sem: 6, code: '3064', name: 'Property Law & Easements', desc: 'Transfer of Property Act, 1882, sales, mortgages, leases, gifts, and Indian Easements Act.' },

    // Sem 7
    { sem: 7, code: '3071', name: 'Public International Law & Human Rights', desc: 'International law sources, sovereignty, treaties, human rights conventions, and international court jurisdiction.' },
    { sem: 7, code: '3072', name: 'Administrative Law', desc: 'Delegated legislation, judicial review of administrative action, natural justice, ombudsman, and writs.' },
    { sem: 7, code: '3073', name: 'Company Law', desc: 'Companies Act 2013, corporate personality, directors, meetings, insider trading, and insolvency winding up.' },
    { sem: 7, code: '3074', name: 'Criminal Law II (CrPC, Juvenile Justice & Probation)', desc: 'Criminal procedural law, FIR, police investigation, bail, charges, trial before Sessions, and appeals.' },

    // Sem 8
    { sem: 8, code: '3081', name: 'Civil Procedure Code and Limitation Act', desc: 'Civil jurisdiction, pleadings, res judicata, interim relief, execution of decrees, appeals, and limitation rules.' },
    { sem: 8, code: '3082', name: 'Law of Evidence', desc: 'Indian Evidence Act, relevancy, dying declarations, burden of proof, estoppel, and examination of witnesses.' },
    { sem: 8, code: '3083', name: 'Law of Taxation', desc: 'Income Tax Act 1961, corporate tax planning, GST architecture, assessment, and appellate tribunals.' },
    { sem: 8, code: '3084', name: 'Environmental Law', desc: 'Environment Protection Act, pollution control boards, forest conservation, NGT jurisprudence, and ESG.' },

    // Sem 9
    { sem: 9, code: '3091', name: 'Interpretation of Statutes & Principles of Legislation', desc: 'Canons of statutory interpretation, literal, golden, mischief rules, and external/internal construction aids.' },
    { sem: 9, code: '3092', name: 'Intellectual Property Rights I (Copyrights & Trademarks)', desc: 'Copyright Act 1957, Trade Marks Act 1999, infringement, passing off, and digital assets.' },
    { sem: 9, code: '3093', name: 'Banking Law & Negotiable Instruments', desc: 'Banking Regulation Act, SARFAESI, RBI governance, and Negotiable Instruments Act Section 138.' },
    { sem: 9, code: '3094', name: 'Clinical Course I: Alternative Dispute Resolution (ADR)', desc: 'Arbitration and Conciliation Act 1996, institutional mediation, conciliation, and Lok Adalat simulation.' },

    // Sem 10 (TEST 4)
    { sem: 10, code: '3101', name: 'Clinical Course II: Professional Ethics and Professional Accounting System', desc: 'Advocates Act 1961, Bar Council of India standards, disciplinary proceedings, and lawyer accountancy.' },
    { sem: 10, code: '3102', name: 'Clinical Course III: Drafting, Pleading and Conveyance', desc: 'Drafting of commercial contracts, plaints, written statements, writ petitions, leases, and conveyance deeds.' },
    { sem: 10, code: '3103', name: 'Clinical Course IV: Moot Court Exercise and Internship', desc: 'Three moot court simulations, corporate/courtroom observation diary, client interview, and internship viva.' },
    { sem: 10, code: '3104', name: 'Intellectual Property Rights II (Patents & Designs)', desc: 'Patents Act 1970, patent claims, compulsory licenses, patent litigation, and Designs Act 2000.' }
  ];

  for (const s of bballbSubjects) {
    const semId = bballbSemMap[s.sem];
    if (!semId) continue;
    await prisma.subject.upsert({
      where: {
        courseId_semesterId_code: {
          courseId: bballb.id,
          semesterId: semId,
          code: s.code
        }
      },
      update: {
        name: s.name,
        description: s.desc
      },
      create: {
        courseId: bballb.id,
        semesterId: semId,
        code: s.code,
        name: s.name,
        description: s.desc,
        isCore: true,
        credits: 4
      }
    });
  }
  console.log(`✓ 5-Year B.B.A. LL.B subjects seeded (${bballbSubjects.length} subjects).`);

  await prisma.$disconnect();
  console.log('✓ Seeding complete!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
