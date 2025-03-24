import createHttpError from 'http-errors';
import { Contact } from '../models/contact.model.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = 'name',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = Contact.find({ userId, ...filter });

  if (sortBy) {
    contactsQuery.sort({ [sortBy]: sortOrder });
  }

  const totalItems = await Contact.countDocuments({ userId, ...filter });
  const contacts = await contactsQuery
    .select('-__v')
    .skip(skip)
    .limit(limit)
    .exec();

  const paginationData = calculatePaginationData(totalItems, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId, userId) => {

  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload) => {
  if (!payload.name || !payload.phoneNumber) {
    throw createHttpError(400, 'Name and phoneNumber are required');
  }


  if (!payload.userId) {
    throw createHttpError(400, 'UserId is required');
  }

  return await Contact.create(payload);
};

export const updateContact = async (
  contactId,
  payload,
  userId,
  options = {},
) => {

  return await Contact.findOneAndUpdate({ _id: contactId, userId }, payload, {
    new: true,
    ...options,
  });
};

export const deleteContact = async (contactId, userId) => {

  return await Contact.findOneAndDelete({ _id: contactId, userId });
};
