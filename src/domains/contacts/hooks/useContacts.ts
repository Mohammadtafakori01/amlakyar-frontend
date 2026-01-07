import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import {
  fetchContacts,
  fetchContactById,
  createContact,
  updateContact,
  deleteContact,
  setSelectedContact,
  clearError,
  resetState,
} from '../store/contactsSlice';
import {
  CreateContactRequest,
  UpdateContactRequest,
  SearchContactsDto,
} from '../types';

export const useContacts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const contacts = useSelector((state: RootState) => state.contacts);

  const fetchContactsAction = useCallback(
    (searchParams?: SearchContactsDto) => dispatch(fetchContacts(searchParams)),
    [dispatch]
  );

  const fetchContactByIdAction = useCallback(
    (id: string) => dispatch(fetchContactById(id)),
    [dispatch]
  );

  const createContactAction = useCallback(
    (data: CreateContactRequest) => dispatch(createContact(data)),
    [dispatch]
  );

  const updateContactAction = useCallback(
    (id: string, data: UpdateContactRequest) => dispatch(updateContact({ id, data })),
    [dispatch]
  );

  const deleteContactAction = useCallback(
    (id: string) => dispatch(deleteContact(id)),
    [dispatch]
  );

  const setSelectedContactAction = useCallback(
    (contact: any) => dispatch(setSelectedContact(contact)),
    [dispatch]
  );

  const clearErrorAction = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  const resetStateAction = useCallback(
    () => dispatch(resetState()),
    [dispatch]
  );

  return {
    ...contacts,
    fetchContacts: fetchContactsAction,
    fetchContactById: fetchContactByIdAction,
    createContact: createContactAction,
    updateContact: updateContactAction,
    deleteContact: deleteContactAction,
    setSelectedContact: setSelectedContactAction,
    clearError: clearErrorAction,
    resetState: resetStateAction,
  };
};

