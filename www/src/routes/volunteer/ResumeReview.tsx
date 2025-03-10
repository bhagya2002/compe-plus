import { useAuth0 } from '@auth0/auth0-react';
import { Button, CircularProgress, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import React, { FC, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import TitledPage from '../../components/TitledPage';
import { refreshResumeReviews } from '../../redux/substores/volunteer/slices/resumeReviewSlice';
import claimResumeReviews from '../../redux/substores/volunteer/thunks/claimResumeReviews';
import getAvailableResumeReviews from '../../redux/substores/volunteer/thunks/getAvailableResumeReviews';
import getReviewingResumeReviews from '../../redux/substores/volunteer/thunks/getReviewingResumeReviews';
import unclaimResumeReviews from '../../redux/substores/volunteer/thunks/unclaimResumeReviews';
import { useVolunteerDispatch, useVolunteerSelector } from '../../redux/substores/volunteer/volunteerHooks';
import { ResumeReviewWithUserDetails as RRWUD } from '../../util/serverResponses';
import ResumeReviewTable from './ResumeReviewTable';
const ResumeReview: FC = () => {
    const { availableResumes, reviewingResumes, availableIsLoading, reviewingIsLoading, shouldReload } = useVolunteerSelector((state) => state.resumeReview);
    const { getAccessTokenSilently, user } = useAuth0();
    const dispatch = useVolunteerDispatch();
    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        if (user?.sub !== undefined && shouldReload) {
            dispatch(getAvailableResumeReviews({ tokenAcquirer: getAccessTokenSilently }));
            dispatch(getReviewingResumeReviews({ tokenAcquirer: getAccessTokenSilently, userId: user.sub }));
        }
    }, [user, shouldReload]);

    const availableTableActions = [
        {
            name: 'Claim',
            func: (resumeReview: RRWUD) => {
                if (reviewingResumes.length + 1 > 3) {
                    alert("You can't claim more than 3 resumes at once. Start reviewing some of them.");
                    return;
                }
                if (user?.sub !== undefined) {
                    dispatch(claimResumeReviews({ tokenAcquirer: getAccessTokenSilently, userId: user.sub, resumeReviewId: resumeReview.id }));
                }
            },
        },
    ];

    const reviewingTableActions = [
        { name: 'Review resume', func: (resumeReview: RRWUD) => history.push(`/resume-review/${resumeReview.id}`) },
        { name: 'Unclaim', func: (resumeReview: RRWUD) => dispatch(unclaimResumeReviews({ tokenAcquirer: getAccessTokenSilently, resumeReviewId: resumeReview.id })) },
    ];

    return (
        <TitledPage title='Resume Review'>
            <Grid container justify='center' alignItems='center' direction='column'>
                <Grid container justify='flex-start' alignItems='flex-start' direction='column'>
                    <Grid container>
                        <Grid item xs={9}>
                            <Typography variant='h2'>Currently Reviewing</Typography>
                        </Grid>
                        <Grid item xs={3} container justify='flex-end'>
                            <Button
                                disabled={availableIsLoading || reviewingIsLoading}
                                onClick={() => dispatch(refreshResumeReviews())}
                                variant='contained'
                                color='primary'
                                startIcon={<RefreshIcon />}
                            >
                                Refresh
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container justify='flex-start' alignItems='flex-start' className={classes.wrapper}>
                        {reviewingIsLoading && (
                            <Grid container justify='center' alignItems='flex-start'>
                                <CircularProgress />
                            </Grid>
                        )}
                        {!reviewingIsLoading && reviewingResumes.length == 0 && (
                            <Typography>You haven&apos;t claimed any resumes to review yet. Claim one of the available resumes below to get started.</Typography>
                        )}
                        {!reviewingIsLoading && reviewingResumes.length > 0 && <ResumeReviewTable resumes={reviewingResumes} actions={reviewingTableActions} />}
                    </Grid>
                </Grid>
                <Grid container justify='flex-start' alignItems='flex-start' direction='column'>
                    <Typography variant='h2'>Available Resumes</Typography>

                    <Grid container justify='flex-start' alignItems='flex-start' className={classes.wrapper}>
                        {availableIsLoading && (
                            <Grid container justify='center' alignItems='flex-start'>
                                <CircularProgress />
                            </Grid>
                        )}
                        {!availableIsLoading && availableResumes.length == 0 && <Typography>There are no available resumes to review. Check back later.</Typography>}
                        {!availableIsLoading && availableResumes.length > 0 && <ResumeReviewTable resumes={availableResumes} actions={availableTableActions} />}
                    </Grid>
                </Grid>
            </Grid>
        </TitledPage>
    );
};

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    wrapper: {
        marginTop: 25,
        marginBottom: 25,
    },
});

export default ResumeReview;
