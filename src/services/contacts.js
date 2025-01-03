import { ContactsCollection } from '../db/models/contact.js';
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
  try {
    const limit = perPage;
    const skip = (page - 1) * perPage;
    const sortOptions = { [sortBy]: sortOrder };

    const contactsQuery = ContactsCollection.find({ userId });

    if (filter.contactType) {
      contactsQuery.where('contactType').equals(filter.contactType);
    }
    if (filter.isFavourite !== undefined) {
      contactsQuery.where('isFavourite').equals(filter.isFavourite);
    }

    const [contactsCount, contacts] = await Promise.all([
      ContactsCollection.find({ userId }).merge(contactsQuery).countDocuments(),
      contactsQuery.skip(skip).limit(limit).sort(sortOptions).lean().exec(),
    ]);

    const paginationData = calculatePaginationData(
      contactsCount,
      perPage,
      page,
    );

    return {
      data: contacts,
      ...paginationData,
    };
  } catch (err) {
    throw new Error(`Failed to get contacts: ${err.message}`);
  }
};

export const getContactById = async (id, userId) => {
  try {
    const contact = await ContactsCollection.findOne({
      _id: id,
      userId,
    }).lean();
    return contact;
  } catch (err) {
    throw new Error(`Failed to get contact by id: ${err.message}`);
  }
};

export const createContact = async (payload, userId) => {
  try {
    const contactPayload = { ...payload, userId };
    const contact = await ContactsCollection.create(contactPayload);
    return contact;
  } catch (err) {
    throw new Error(`Failed to create contact: ${err.message}`);
  }
};

export const deleteContact = async (id, userId) => {
  try {
    const contact = await ContactsCollection.findOneAndDelete({
      _id: id,
      userId,
    }).lean();
    return contact;
  } catch (err) {
    throw new Error(`Failed to delete contact: ${err.message}`);
  }
};

export const updateContact = async (id, payload, userId) => {
  try {
    const rawResult = await ContactsCollection.findOneAndUpdate(
      { _id: id, userId },
      payload,
    ).lean();

    if (!rawResult) return null;

    return {
      contact: rawResult,
    };
  } catch (err) {
    throw new Error(`Failed to update contact: ${err.message}`);
  }
};
