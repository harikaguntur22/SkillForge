import * as exchangeService from '../services/exchangeService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getMatches = async (req, res, next) => {
  try {
    const matches = await exchangeService.getMatches(req.user._id);
    return sendSuccess(res, 200, { matches }, 'Matched peers retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const request = await exchangeService.createExchangeRequest(req.user._id, req.body);
    return sendSuccess(res, 201, { request }, 'Skill exchange request sent successfully.');
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const requests = await exchangeService.getUserExchangeRequests(req.user._id);
    return sendSuccess(res, 200, requests, 'User exchange requests retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const updated = await exchangeService.updateExchangeRequestStatus(
      req.user._id,
      req.params.id,
      req.body.status
    );
    return sendSuccess(
      res,
      200,
      { request: updated },
      `Exchange request marked as ${req.body.status}.`
    );
  } catch (error) {
    next(error);
  }
};
