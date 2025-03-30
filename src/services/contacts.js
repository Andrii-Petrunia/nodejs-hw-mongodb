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

  let contactsQuery = Contact.find({ userId, ...filter });

  if (sortBy) {
    contactsQuery = contactsQuery.sort({ [sortBy]: sortOrder });
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

export const getContactById = (contactId, userId) =>
  Contact.findOne({ _id: contactId, userId });

export const createContact = async (payload) => {
  if (!payload?.name || !payload?.phoneNumber) {
    throw createHttpError(400, 'Name and phoneNumber are required');
  }

  if (!payload?.userId) {
    throw createHttpError(400, 'UserId is required');
  }

  return Contact.create(payload);
};

export const updateContact = (contactId, payload, userId, options = {}) =>
  Contact.findOneAndUpdate({ _id: contactId, userId }, payload, {
    new: true,
    ...options,
  });

export const deleteContact = async (contactId, userId) => {
  const contact = await Contact.findOneAndDelete({ _id: contactId, userId });

  if (!contact) {
    throw createHttpError(404, 'Contact not found or does not belong to you');
  }

  return contact;
};
