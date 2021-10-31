import { createSlice } from '@reduxjs/toolkit';

export const SignDocumentSlice = createSlice({
    name: 'signDoc',
    initialState: {
        docToSign: null,
        userDocument: {
            documents: [],
            user: {},
        },
        signedObj: {
            document_xfdfs: [],
            contract_uuid: null,
            user_uuid: null,
        },
    },
    reducers: {
        setUserDocument: (state, action) => {
            state.userDocument = action.payload;
        },
        setSignObj: (state, action) => {
            state.signedObj = action.payload;
        },
        setDocToSign: (state, action) => {
            state.docToSign = action.payload;
        },
        resetDocToSign: (state, action) => {
            state.docToSign = null;
        },
    },
});

export const selectDocToSign = (state) => state.signDoc.docToSign;

export const { setDocToSign, resetDocToSign, setUserDocument, setSignObj } =
    SignDocumentSlice.actions;

export const selectUserDocument = (state) => state.signDoc.userDocument;

export const selectSignedObj = (state) => state.signDoc.signedObj;

export default SignDocumentSlice.reducer;
