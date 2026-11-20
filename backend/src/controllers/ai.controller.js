const { successResponse, errorResponse } = require('../utils/apiResponse');
const { askLegalTutor, explainConcept, generatePracticeQuestions, summarizeDocument } = require('../services/ai.service');

const askTutor = async (req, res, next) => {
  try {
    const { prompt, subject, contextText } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return errorResponse(res, 'Please provide a valid question.', 400);
    }

    const answer = await askLegalTutor(prompt, subject, contextText);
    return successResponse(res, { answer });
  } catch (error) {
    next(error);
  }
};

const explain = async (req, res, next) => {
  try {
    const { concept, subject } = req.body;

    if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
      return errorResponse(res, 'Please specify the legal concept to explain.', 400);
    }

    const explanation = await explainConcept(concept, subject);
    return successResponse(res, { explanation });
  } catch (error) {
    next(error);
  }
};

const practiceQuestions = async (req, res, next) => {
  try {
    const { subject, topic, scheme = '80' } = req.body;

    if (!subject) {
      return errorResponse(res, 'Subject name is required.', 400);
    }

    const questions = await generatePracticeQuestions(subject, topic, scheme);
    return successResponse(res, { questions });
  } catch (error) {
    next(error);
  }
};

const summarize = async (req, res, next) => {
  try {
    const { text, title } = req.body;

    if (!text || text.trim().length < 50) {
      return errorResponse(res, 'Please provide text of at least 50 characters to summarize.', 400);
    }

    const summary = await summarizeDocument(text, title);
    return successResponse(res, { summary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askTutor,
  explain,
  practiceQuestions,
  summarize
};
