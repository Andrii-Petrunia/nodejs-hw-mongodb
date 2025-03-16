import createHttpError from 'http-errors';
import { Contact } from '../models/contact.model.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = 'name',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  let contactsQuery = Contact.find(filter);

  if (filter) {
    contactsQuery = contactsQuery.find(filter);
  }

  if (sortBy) {
    contactsQuery = contactsQuery.sort({
      [sortBy]: sortOrder
    });
  }

  const totalItems = await Contact.countDocuments(filter);
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

export const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  if (!payload.name || !payload.phoneNumber) {
    throw createHttpError(400, 'Name and phoneNumber are required');
  }

  const contact = await Contact.create(payload);
  return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      ...options,
    },
  );
  return updatedContact;
};

export const deleteContact = async (contactId) => {
  const contact = await Contact.findOneAndDelete({
    _id: contactId,
  });

  return contact;
};
