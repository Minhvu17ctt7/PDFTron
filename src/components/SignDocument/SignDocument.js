import React, { useRef, useEffect, useState } from 'react';
import { navigate, useLocation } from '@reach/router';
import { Box, Column, Heading, Row, Stack, Button } from 'gestalt';
import WebViewer from '@pdftron/webviewer';
import 'gestalt/dist/gestalt.css';
import './SignDocument.css';
import documentApi from '../../api/documentApi';

const SignDocument = () => {
    const [annotManager, setAnnotatManager] = useState(null);
    const [annotPosition, setAnnotPosition] = useState(0);

    const location = useLocation();

    const [userDocument, setUserDocument] = useState({});
    const [signedObj, setSignedObj] = useState({});

    const viewer = useRef(null);

    useEffect(() => {
        WebViewer(
            {
                path: 'webviewer',
                disabledElements: [
                    'ribbons',
                    'toggleNotesButton',
                    'searchButton',
                    'menuButton',
                    'rubberStampToolGroupButton',
                    'stampToolGroupButton',
                    'fileAttachmentToolGroupButton',
                    'calloutToolGroupButton',
                    'undo',
                    'redo',
                    'eraserToolButton',
                ],
            },
            viewer.current
        ).then(async (instance) => {
            const queryParam = new URLSearchParams(location.search);
            const r = queryParam.get('r');
            const c = queryParam.get('c');

            try {
                const response = await documentApi.getSigning(c, r);
                setUserDocument(response);
                setSignedObj((prevState) => ({
                    ...prevState,
                    contract_uuid: c,
                    user_uuid: r,
                }));
                
                const { docViewer, annotManager, Annotations } = instance;
                setAnnotatManager(annotManager);

                // select only the insert group
                instance.setToolbarGroup('toolbarGroup-Insert');

                // load document
                const URL = response.documents[0].url; //await storageRef.child(docRef).getDownloadURL();
                docViewer.loadDocument(URL);

                const normalStyles = (widget) => {
                    if (widget instanceof Annotations.TextWidgetAnnotation) {
                        return {
                            'background-color': '#a5c7ff',
                            color: 'white',
                        };
                    } else if (
                        widget instanceof Annotations.SignatureWidgetAnnotation
                    ) {
                        return {
                            border: '1px solid #a5c7ff',
                        };
                    }
                };

                annotManager.on(
                    'annotationChanged',
                    (annotations, action, { imported }) => {
                        if (imported && action === 'add') {
                            annotations.forEach(function (annot) {
                                if (
                                    annot instanceof
                                    Annotations.WidgetAnnotation
                                ) {
                                    Annotations.WidgetAnnotation.getCustomStyles =
                                        normalStyles;
                                    if (
                                        !annot.fieldName.startsWith(
                                            response.user.email
                                        )
                                    ) {
                                        annot.Hidden = true;
                                        annot.Listable = false;
                                    }
                                }
                            });
                        }
                    }
                );
            } catch (error) {
                console.error('Error on showing documents:');
                console.error(error.message);
            }
        });
    }, []);

    const nextField = () => {
        let annots = annotManager.getAnnotationsList();
        if (annots[annotPosition]) {
            annotManager.jumpToAnnotation(annots[annotPosition]);
            if (annots[annotPosition + 1]) {
                setAnnotPosition(annotPosition + 1);
            }
        }
    };

    const prevField = () => {
        let annots = annotManager.getAnnotationsList();
        if (annots[annotPosition]) {
            annotManager.jumpToAnnotation(annots[annotPosition]);
            if (annots[annotPosition - 1]) {
                setAnnotPosition(annotPosition - 1);
            }
        }
    };

    const completeSigning = async () => {
        const xfdf = await annotManager.exportAnnotations({
            widgets: false,
            links: false,
        });
        
        const document_xfdf = {
            xfdf,
            document_uuid: userDocument.documents[0].id,
        }

        documentApi.signByReceiver({
            ...signedObj,
            document_xfdfs: [document_xfdf]
        });
                

        // await updateDocumentToSign(docId, email, xfdf);
        navigate('/');
    };

    return (
        <div className={'prepareDocument'}>
            <Box display="flex" direction="row" flex="grow">
                <Column span={2}>
                    <Box padding={3}>
                        <Heading size="md">Sign Document</Heading>
                    </Box>
                    <Box padding={3}>
                        <Row gap={1}>
                            <Stack>
                                <Box padding={2}>
                                    <Button
                                        onClick={nextField}
                                        accessibilityLabel="next field"
                                        text="Next field"
                                        iconEnd="arrow-forward"
                                    />
                                </Box>
                                <Box padding={2}>
                                    <Button
                                        onClick={prevField}
                                        accessibilityLabel="Previous field"
                                        text="Previous field"
                                        iconEnd="arrow-back"
                                    />
                                </Box>
                                <Box padding={2}>
                                    <Button
                                        onClick={completeSigning}
                                        accessibilityLabel="complete signing"
                                        text="Complete signing"
                                        iconEnd="compose"
                                    />
                                </Box>
                            </Stack>
                        </Row>
                    </Box>
                </Column>
                <Column span={10}>
                    <div className="webviewer" ref={viewer}></div>
                </Column>
            </Box>
        </div>
    );
};

export default SignDocument;
