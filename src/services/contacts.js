import createHttpError from 'http-errors';
import { Contact } from '../models/contact.model.js';

export const getAllContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
};

export const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  if (!payload.name || !payload.phoneNumber) {
    throw createHttpError(400, 'Name and phoneNumber are required');
  }
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
