const axios = require('axios');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_LEGAL_PROMPT = `
You are the KSLU Circle Academic AI Assistant, an expert pedagogical tutor specialized in Karnataka State Law University (KSLU) syllabi and Indian Jurisprudence.
Your goal is to explain legal concepts, assist law students in understanding statutes, landmark Supreme Court & High Court judgments, and prepare high-scoring answers for semester examinations under Scheme 80 Marks and Scheme 100 Marks.

STRICT GUIDELINES:
1. Always maintain a clear pedagogical and academic tone.
2. NEVER invent fake case citations or imaginary section numbers. Cite only authentic statutory provisions (e.g., Constitution of India, IPC/BNS, CrPC/BNSS, CPC, Indian Evidence Act/BSA, Contract Act 1872, Transfer of Property Act 1882) and verified landmark precedents (e.g., Kesavananda Bharati, Maneka Gandhi, Rylands v. Fletcher, Ashby v. White).
3. If uncertain of a specific citation, explain the doctrine clearly and state that the student should cross-verify the citation in the official law reports (SCC / AIR).
4. Clearly state at the end of every answer:
   "DISCLAIMER: This analysis is provided solely for academic and educational exam-preparation purposes and does not constitute professional legal advice."
`;

/**
 * Ask general law tutor question
 */
const askLegalTutor = async (prompt, subject = null, contextText = '') => {
  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_LEGAL_PROMPT}\n\nSubject Context: ${subject || 'General Law'}\nReference Material: ${contextText || 'None'}\n\nStudent Question: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500
        }
      };

      const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
      const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) return answer;
    } catch (err) {
      logger.error('Gemini API call failed, using intelligent legal engine fallback:', err.message);
    }
  }

  // Intelligent fallback for local development or when API key is not configured
  return generateCurriculumFallback(prompt, subject);
};

/**
 * Explain a specific legal concept
 */
const explainConcept = async (conceptName, subject = null) => {
  const prompt = `Please provide a thorough, exam-oriented explanation of the legal concept "${conceptName}".
Structure the response as:
1. Definition & Etymology / Origin
2. Essential Legal Elements
3. Landmark Precedents & Indian Case Law Authorities
4. Key Exceptions or Defences
5. KSLU Exam Tip (How to score maximum marks in 8-mark or 16-mark answers)`;

  return askLegalTutor(prompt, subject);
};

/**
 * Generate practice examination questions
 */
const generatePracticeQuestions = async (subjectName, topic = '', marksPattern = '80') => {
  const prompt = `Generate 5 high-yield examination questions for the subject "${subjectName}" on the topic "${topic || 'All Units'}" suited for KSLU Scheme ${marksPattern} Marks (16-mark essay questions and 8-mark short problem/concept questions), accompanied by concise model answer pointers and case citations.`;
  return askLegalTutor(prompt, subjectName);
};

/**
 * Summarize legal document or PDF notes
 */
const summarizeDocument = async (extractedText, title = 'Document') => {
  const prompt = `Please summarize the following law notes / document titled "${title}".
Provide:
1. Executive Summary
2. Core Legal Issues and Propositions
3. Statutory Provisions Referenced
4. Key Judicial Rulings Mentioned
5. Revision Summary Points for Exams

Content:
${extractedText.substring(0, 8000)}`;

  return askLegalTutor(prompt, 'Document Summary');
};

/**
 * Structured academic response generator for offline dev mode
 */
function generateCurriculumFallback(prompt, subject = '') {
  const p = prompt.toLowerCase();
  
  if (p.includes('article 21') || p.includes('life and personal liberty')) {
    return `### Academic Concept Analysis: Article 21 of the Constitution of India

#### 1. Constitutional Text:
*"No person shall be deprived of his life or personal liberty except according to procedure established by law."*

#### 2. The Judicial Evolution Paradigm:
* **A.K. Gopalan v. State of Madras (AIR 1950 SC 27):**
  The Supreme Court took an orthodox, narrow literal view. It held that "procedure established by law" meant any law enacted by the legislature, without inquiring into its substantive fairness.
* **Maneka Gandhi v. Union of India (AIR 1978 SC 597):**
  A landmark turning point that revolutionized Indian constitutional jurisprudence. The Supreme Court injected the American concept of **"Procedural Due Process"** into Article 21. Any procedure curtailing life or liberty must be **just, fair, and reasonable**, and not fanciful, oppressive, or arbitrary.
* **Interrelation of Articles 14, 19, and 21 (The Golden Triangle):**
  A law depriving personal liberty must satisfy the tests of Article 14 (equality and non-arbitrariness) and Article 19 (reasonable restrictions).

#### 3. Expanded Facets of Article 21:
* **Right to Privacy:** *K.S. Puttaswamy v. Union of India (2017) 10 SCC 1* – Unanimously affirmed privacy as an intrinsic fundamental right with a 3-fold proportionality test.
* **Right to Clean Environment:** *M.C. Mehta v. Union of India (Oleum Gas Leak case)*.
* **Right to Free Legal Aid & Speedy Trial:** *Hussainara Khatoon v. Home Secretary, State of Bihar (1979)*.
* **Right to Livelihood:** *Olga Tellis v. Bombay Municipal Corporation (1985)*.

#### 4. KSLU Examination Answer Writing Structure (16 Marks):
1. **Introduction:** Bare text and significance as the heart of Part III.
2. **Transition Analysis:** Trace the shift from *Gopalan* (lex) to *Maneka Gandhi* (jus).
3. **Sub-rights Tabulation:** List at least 4 expanded rights with matching cases.
4. **Conclusion:** Summarize how Article 21 acts as a living organic provision.

*DISCLAIMER: This analysis is provided solely for academic and educational exam-preparation purposes and does not constitute professional legal advice.*`;
  }

  if (p.includes('damnum') || p.includes('injuria') || p.includes('torts')) {
    return `### Academic Concept Analysis: Damnum Sine Injuria vs. Injuria Sine Damno

#### 1. Conceptual Framework & Latin Foundations:
* **Damnum:** Substantial physical, material, or financial loss/damage.
* **Injuria:** Infringement of an actionable legal right granted by law.
* **Sine:** Without.

#### 2. Damnum Sine Injuria (Damage without Legal Injury):
* **Principle:** Actual damage or financial harm is suffered by the plaintiff, but no legal right recognized by law has been infringed. Hence, **no action lies in tort**.
* **Leading Case Law:** *Gloucester Grammar School Case (1410) YB 11 Hen IV*
  * **Facts:** A schoolmaster established a rival grammar school adjacent to the plaintiff's established school, reducing the plaintiff's tuition fee earnings.
  * **Ruling:** The defendant merely exercised his legitimate right to carry on trade. Financial loss arising from healthy lawful competition is non-actionable.
* **Indian Precedent:** *Chasemore v. Richards (1859)* & *Town Area Committee v. Prabhu Dayal (AIR 1975 All 132)*.

#### 3. Injuria Sine Damno (Legal Injury without Actual Damage):
* **Principle:** An absolute legal right of the plaintiff is violated, but the plaintiff suffers no pecuniary or physical damage. It is **actionable per se** (without proof of actual damage).
* **Leading Case Law:** *Ashby v. White (1703) 2 Ld. Raym. 938*
  * **Facts:** The defendant returning officer maliciously prevented the plaintiff, a qualified parliamentary voter, from casting his ballot. The candidate for whom the plaintiff intended to vote won the election anyway.
  * **Ruling:** Chief Justice Holt formulated the timeless maxim: *"Ubi jus ibi remedium"* (Where there is a right, there is a remedy). Every injury imports a damage; infringement of a constitutional franchise is actionable per se.
* **Indian Application:** *Bhim Singh v. State of J&K (AIR 1986 SC 494)* – MLA unlawfully arrested to prevent him from attending the legislative assembly; exemplary compensation awarded under public law remedy.

*DISCLAIMER: This analysis is provided solely for academic and educational exam-preparation purposes and does not constitute professional legal advice.*`;
  }

  return `### KSLU Academic Legal Guidance: ${subject || 'Legal Studies'}

#### 1. Core Statutory Framework:
When addressing questions on this topic in Karnataka State Law University examinations, identify the primary governing statute, statutory definitions, and operative sections.

#### 2. Essential Ingredients:
Break down the legal concept into its statutory elements:
- Actus Reus / Operative Conduct
- Mens Rea / Mental State or Standard of Care
- Causation and Nexus
- Standing and Statutory Jurisdiction

#### 3. Landmark Judicial Authorities:
Always incorporate verified Supreme Court of India precedents and High Court rulings. Emphasize the ratio decidendi rather than factual trivia.

#### 4. Model Answer Blueprint for Scheme 80 & 100:
- **Headnote & Statutory Definition (2 Marks):** Quote key words from the section.
- **Doctrinal Analysis (6 Marks):** Explain tests and comparative jurisprudence.
- **Leading Case Laws (6 Marks):** At least two authoritative precedents.
- **Exceptions & Modern Reform (2 Marks):** Law Commission recommendations or recent amendments.

*DISCLAIMER: This analysis is provided solely for academic and educational exam-preparation purposes and does not constitute professional legal advice.*`;
}

module.exports = {
  askLegalTutor,
  explainConcept,
  generatePracticeQuestions,
  summarizeDocument
};
