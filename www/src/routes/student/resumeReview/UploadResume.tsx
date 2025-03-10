import { useAuth0 } from '@auth0/auth0-react';
import { Backdrop, Box, CircularProgress, IconButton, makeStyles, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { Cancel, CheckCircle } from '@material-ui/icons';
import PublishIcon from '@material-ui/icons/Publish';
import React, { FC, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import PDFViewer from '../../../components/pdf/PDFViewer';
import { setIsUploadingResume } from '../../../redux/substores/student/slices/resumeReviewSlice';
import { resetUploadResume, setDocument } from '../../../redux/substores/student/slices/uploadResumeSlice';
import { useStudentDispatch, useStudentSelector } from '../../../redux/substores/student/studentHooks';
import { StudentDispatch } from '../../../redux/substores/student/studentStore';
import initiateResumeReview from '../../../redux/substores/student/thunks/initiateResumeReview';
import config from '../../../util/config';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../../../util/helpers';

const handleOnFileSelected = async (dispatch: StudentDispatch, files?: FileList | null) => {
    if (files === undefined || files === null) {
        alert('No file selected');
        return;
    }

    if (files?.length !== 1) {
        alert('You can only select 1 file');
        return;
    }

    const pdfFile = files[0];

    if (pdfFile.type !== 'application/pdf') {
        alert('File selected must be pdf');
        return;
    }

    if (pdfFile.size >= config.maxResumeSizeBytes) {
        alert('File is too large');
        return;
    }

    const file = await pdfFile.arrayBuffer();

    dispatch(
        setDocument({
            name: pdfFile.name,
            base64Contents: arrayBufferToBase64(file),
        }),
    );
};

const UploadResume: FC = () => {
    const classes = useStyles();
    const dispatch = useStudentDispatch();
    const { user, getAccessTokenSilently } = useAuth0();
    const { document, isLoading, isUploadComplete } = useStudentSelector((state) => state.uploadResume);

    useEffect(() => {
        // Reset when user revisits this page
        return () => {
            dispatch(resetUploadResume());
        };
    }, []);

    useEffect(() => {
        // Redirect back to resume review list once upload is complete
        if (isUploadComplete) {
            dispatch(setIsUploadingResume(false));
        }
    }, [dispatch, isUploadComplete]);

    const onDrop = useCallback((acceptedFiles) => {
        handleOnFileSelected(dispatch, acceptedFiles);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    if (document === null) {
        return (
            <Grid container item xs={12} justify='center'>
                <div {...getRootProps()} className={classes.uploadBox}>
                    <input {...getInputProps()} />
                    <Box display='flex' alignItems='center'>
                        <PublishIcon className={classes.uploadIcon} />
                        <Typography>Drag and Drop or </Typography>
                        <div className={classes.browseButton}>
                            <Typography>Browse computer</Typography>
                        </div>
                    </Box>
                </div>
            </Grid>
        );
    }

    const filePromise = async () => {
        return base64ToArrayBuffer(document.base64Contents);
    };

    return (
        <Grid container item xs={12} spacing={2} justify='center' className={classes.root}>
            <Backdrop open={isLoading} className={classes.backdrop}>
                <CircularProgress color='inherit' />
            </Backdrop>
            <Grid container item xs={12} justify='center'>
                <Typography>Ready to upload?</Typography>
            </Grid>
            <Grid container item sm={12} md={8} justify='center'>
                <PDFViewer
                    fileName={document.name}
                    filePromise={filePromise}
                    className={classes.pdfContainer}
                    viewerConfig={{ showAnnotationTools: false, enableFormFilling: false, showLeftHandPanel: false }}
                />
            </Grid>
            <Grid container item xs={12} justify='center'>
                <span>
                    <IconButton aria-label='cancel' onClick={() => dispatch(setIsUploadingResume(false))}>
                        <Cancel />
                    </IconButton>
                    <IconButton
                        aria-label='confirm'
                        onClick={() =>
                            dispatch(
                                initiateResumeReview({
                                    base64Contents: document.base64Contents,
                                    tokenAcquirer: getAccessTokenSilently,
                                    userId: user?.sub ?? '',
                                }),
                            )
                        }
                    >
                        <CheckCircle />
                    </IconButton>
                </span>
            </Grid>
        </Grid>
    );
};

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
    },
    pdfContainer: {
        minHeight: '60vh',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    uploadBox: {
        padding: theme.spacing(4),
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6),
        backgroundColor: fade(theme.palette.primary.main, 0.5),
        transition: theme.transitions.create('background-color', {
            duration: theme.transitions.duration.shortest,
        }),
        border: '2px dashed rgba(0, 0, 0, 0.3)',
        '&:hover': {
            cursor: 'pointer',
            backgroundColor: fade(theme.palette.primary.main, 0.6),
        },
    },
    uploadIcon: {
        marginRight: theme.spacing(1),
    },
    browseButton: {
        margin: theme.spacing(1),
        padding: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
    },
    browseButton2: {
        ...theme.typography.body1,
        textTransform: 'none',
    },
}));

export default UploadResume;
