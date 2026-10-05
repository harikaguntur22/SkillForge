import { SkillExchangeRequest } from '../models/SkillExchangeRequest.js';
import { SkillSession } from '../models/SkillSession.js';
import { User } from '../models/User.js';
import { UserSkill } from '../models/UserSkill.js';
import { AppError } from '../utils/appError.js';
import { findMatchesForUser, calculatePairCompatibility } from './exchangeMatchingEngine.js';
import { SKILL_INTENTS } from '../config/constants.js';

export const getMatches = async (userId) => {
  return await findMatchesForUser(userId);
};

export const createExchangeRequest = async (senderId, payload) => {
  const { receiverId, offeredSkillIds, requestedSkillIds, message } = payload;

  if (senderId.toString() === receiverId.toString()) {
    throw new AppError('You cannot send a skill exchange request to yourself.', 400);
  }

  // Check receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new AppError('The target user was not found.', 404);
  }

  // Check for existing pending request
  const existingPending = await SkillExchangeRequest.findOne({
    $or: [
      { senderId, receiverId, status: 'PENDING' },
      { senderId: receiverId, receiverId: senderId, status: 'PENDING' },
    ],
  });

  if (existingPending) {
    throw new AppError(
      'An active exchange request between you and this student already exists.',
      409
    );
  }

  // Calculate compatibility score and match reasons
  const sender = await User.findById(senderId).lean();
  const senderSkills = await UserSkill.find({ userId: senderId }).populate('skillId').lean();
  const receiverSkills = await UserSkill.find({ userId: receiverId }).populate('skillId').lean();

  const userAData = {
    user: sender,
    teach: senderSkills.filter((s) => s.type === SKILL_INTENTS.TEACH),
    learn: senderSkills.filter((s) => s.type === SKILL_INTENTS.LEARN),
  };

  const userBData = {
    user: receiver,
    teach: receiverSkills.filter((s) => s.type === SKILL_INTENTS.TEACH),
    learn: receiverSkills.filter((s) => s.type === SKILL_INTENTS.LEARN),
  };

  const matchCalculation = calculatePairCompatibility(userAData, userBData);

  const newRequest = new SkillExchangeRequest({
    senderId,
    receiverId,
    offeredSkillIds: offeredSkillIds || [],
    requestedSkillIds: requestedSkillIds || [],
    compatibilityScore: matchCalculation?.compatibilityScore || 50,
    matchReasons: matchCalculation?.matchReasons || ['Direct peer skill exchange'],
    message: message || '',
    status: 'PENDING',
  });

  await newRequest.save();

  return await SkillExchangeRequest.findById(newRequest._id)
    .populate('senderId', 'name profileImage college targetRole email')
    .populate('receiverId', 'name profileImage college targetRole email')
    .populate('offeredSkillIds', 'name category icon')
    .populate('requestedSkillIds', 'name category icon');
};

export const getUserExchangeRequests = async (userId) => {
  const incoming = await SkillExchangeRequest.find({ receiverId: userId })
    .populate('senderId', 'name profileImage college branch targetRole email')
    .populate('offeredSkillIds', 'name category icon')
    .populate('requestedSkillIds', 'name category icon')
    .sort({ createdAt: -1 })
    .lean();

  const outgoing = await SkillExchangeRequest.find({ senderId: userId })
    .populate('receiverId', 'name profileImage college branch targetRole email')
    .populate('offeredSkillIds', 'name category icon')
    .populate('requestedSkillIds', 'name category icon')
    .sort({ createdAt: -1 })
    .lean();

  return { incoming, outgoing };
};

export const updateExchangeRequestStatus = async (userId, requestId, status) => {
  const validStatuses = ['ACCEPTED', 'REJECTED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status '${status}'. Must be ACCEPTED, REJECTED, or CANCELLED.`, 400);
  }

  const request = await SkillExchangeRequest.findById(requestId);
  if (!request) {
    throw new AppError('Exchange request not found.', 404);
  }

  // Authorization checks
  if (status === 'CANCELLED') {
    if (request.senderId.toString() !== userId.toString()) {
      throw new AppError('Only the sender can cancel a request.', 403);
    }
  } else if (['ACCEPTED', 'REJECTED'].includes(status)) {
    if (request.receiverId.toString() !== userId.toString()) {
      throw new AppError('Only the recipient can accept or reject this request.', 403);
    }
  }

  request.status = status;
  await request.save();

  return await SkillExchangeRequest.findById(request._id)
    .populate('senderId', 'name profileImage college targetRole email')
    .populate('receiverId', 'name profileImage college targetRole email')
    .populate('offeredSkillIds', 'name category icon')
    .populate('requestedSkillIds', 'name category icon');
};

// --- Sessions Management ---

export const createSession = async (userId, sessionData) => {
  const { exchangeRequestId, mentorId, learnerId, skillId, scheduledAt, durationMinutes, meetingUrl, mentorNotes } = sessionData;

  const request = await SkillExchangeRequest.findById(exchangeRequestId);
  if (!request) {
    throw new AppError('Exchange request not found.', 404);
  }

  if (request.status !== 'ACCEPTED') {
    throw new AppError('Sessions can only be scheduled for accepted exchange requests.', 400);
  }

  // Verify that the user scheduling is a participant
  if (
    userId.toString() !== request.senderId.toString() &&
    userId.toString() !== request.receiverId.toString()
  ) {
    throw new AppError('Unauthorized to schedule a session for this exchange.', 403);
  }

  const session = new SkillSession({
    exchangeRequestId,
    mentorId,
    learnerId,
    skillId,
    scheduledAt: new Date(scheduledAt),
    durationMinutes: durationMinutes || 45,
    meetingUrl: meetingUrl || '',
    mentorNotes: mentorNotes || '',
    status: 'SCHEDULED',
  });

  await session.save();

  return await SkillSession.findById(session._id)
    .populate('mentorId', 'name profileImage college targetRole email')
    .populate('learnerId', 'name profileImage college targetRole email')
    .populate('skillId', 'name category icon');
};

export const getUserSessions = async (userId) => {
  return await SkillSession.find({
    $or: [{ mentorId: userId }, { learnerId: userId }],
  })
    .populate('mentorId', 'name profileImage college targetRole email')
    .populate('learnerId', 'name profileImage college targetRole email')
    .populate('skillId', 'name category icon')
    .sort({ scheduledAt: 1 })
    .lean();
};

export const updateSessionStatus = async (userId, sessionId, status, notes) => {
  const session = await SkillSession.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found.', 404);
  }

  if (
    session.mentorId.toString() !== userId.toString() &&
    session.learnerId.toString() !== userId.toString()
  ) {
    throw new AppError('Unauthorized to modify this session.', 403);
  }

  if (status) session.status = status;
  if (notes) session.mentorNotes = notes;

  await session.save();

  return await SkillSession.findById(session._id)
    .populate('mentorId', 'name profileImage college targetRole email')
    .populate('learnerId', 'name profileImage college targetRole email')
    .populate('skillId', 'name category icon');
};

export const submitFeedback = async (learnerId, sessionId, { rating, review }) => {
  const session = await SkillSession.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found.', 404);
  }

  if (session.learnerId.toString() !== learnerId.toString()) {
    throw new AppError('Only the learner can submit feedback for this session.', 403);
  }

  if (session.status !== 'COMPLETED') {
    // If not marked completed yet, auto-mark completed upon submitting feedback
    session.status = 'COMPLETED';
  }

  session.learnerFeedback = {
    rating: Number(rating),
    review: review || '',
    submittedAt: new Date(),
  };

  await session.save();

  return await SkillSession.findById(session._id)
    .populate('mentorId', 'name profileImage college targetRole email')
    .populate('learnerId', 'name profileImage college targetRole email')
    .populate('skillId', 'name category icon');
};
