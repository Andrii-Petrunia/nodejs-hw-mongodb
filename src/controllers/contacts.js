import createHttpError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const validSortFields = [
  'name',
  'phoneNumber',
  'email',
  'contactType',
  'createdAt',
  'updatedAt',
];

export const getAllContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    if (sortBy && !validSortFields.includes(sortBy)) {
      return next(createHttpError(400, 'Invalid sortBy field'));
    }

    const contacts = await getAllContacts({
      userId: req.user._id,
      page,
      perPage,
      sortBy,
      sortOrder,
      filter,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data: contacts.data,
        page: contacts.page,
        perPage: contacts.perPage,
        totalItems: contacts.totalItems,
        totalPages: contacts.totalPages,
        hasNextPage: contacts.hasNextPage,
        hasPreviousPage: contacts.hasPreviousPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId, req.user._id);

    if (!contact) {
      throw createHttpError(404, 'Contact not found or does not belong to you');
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    const photo = req.file;
    let photoUrl = null;

    if (photo && getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    }

    const contact = await createContact({
      ...req.body,
      userId: req.user._id,
      photo: photoUrl,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const patchContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const photo = req.file;
    let photoUrl = null;

    if (photo && getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    }

    const contact = await updateContact(
      contactId,
      {
        ...req.body,
        ...(photoUrl ? { photo: photoUrl } : {}),
      },
      req.user._id,
    );

    if (!contact) {
      throw createHttpError(404, 'Contact not found or does not belong to you');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await deleteContact(contactId, req.user._id);

    if (!contact) {
      throw createHttpError(404, 'Contact not found or does not belong to you');
    }

    res
      .status(204)
      .json({ status: 204, message: 'Successfully deleted a contact!' });
  } catch (error) {
    next(error);
  }
};
