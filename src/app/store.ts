import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../domains/auth/store/authSlice';
import usersReducer from '../domains/users/store/usersSlice';
import profileReducer from '../domains/profile/store/profileSlice';
import estatesReducer from '../domains/estates/store/estatesSlice';
import contractsReducer from '../domains/contracts/store/contractsSlice';
import propertyFilesReducer from '../domains/property-files/store/propertyFilesSlice';
import contactsReducer from '../domains/contacts/store/contactsSlice';
import clientLogsReducer from '../domains/client-logs/store/clientLogsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    profile: profileReducer,
    estates: estatesReducer,
    contracts: contractsReducer,
    propertyFiles: propertyFilesReducer,
    contacts: contactsReducer,
    clientLogs: clientLogsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

