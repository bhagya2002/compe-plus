import { createSlice } from '@reduxjs/toolkit';

import { ResumeReviewWithName } from '../../../../util/serverResponses';
import claimResumeReviews from '../thunks/claimResumeReviews';
import getAvailableResumeReviews from '../thunks/getAvailableResumeReviews';
import getReviewingResumeReviews from '../thunks/getReviewingResumeReviews';
import unclaimResumeReviews from '../thunks/unclaimResumeReviews';

type ResumeReviewState = {
    availableResumes: ResumeReviewWithName[];
    reviewingResumes: ResumeReviewWithName[];
    availableIsLoading: boolean;
    reviewingIsLoading: boolean;
    shouldReload: boolean;
};

const initialState: ResumeReviewState = {
    availableResumes: [],
    reviewingResumes: [],
    availableIsLoading: false,
    reviewingIsLoading: false,
    shouldReload: false,
};

export const resumeReviewSlice = createSlice({
    name: 'resumeReview',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAvailableResumeReviews.pending, (state) => {
            state.availableIsLoading = true;
        });
        builder.addCase(getAvailableResumeReviews.fulfilled, (state, action) => {
            state.availableIsLoading = false;
            state.shouldReload = false;
            state.availableResumes = action.payload.resumeReviews;
        });
        builder.addCase(getReviewingResumeReviews.pending, (state) => {
            state.reviewingIsLoading = true;
        });
        builder.addCase(getReviewingResumeReviews.fulfilled, (state, action) => {
            state.reviewingIsLoading = false;
            state.shouldReload = false;
            state.reviewingResumes = action.payload.resumeReviews;
        });
        builder.addCase(claimResumeReviews.fulfilled, (state) => {
            state.shouldReload = true;
        });
        builder.addCase(unclaimResumeReviews.fulfilled, (state) => {
            state.shouldReload = true;
        });
    },
});

export default resumeReviewSlice.reducer;
