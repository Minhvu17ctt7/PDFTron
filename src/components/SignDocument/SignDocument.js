import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { navigate, useLocation } from "@reach/router";
import { Box, Column, Heading, Row, Stack, Button } from "gestalt";
import { selectDocToSign } from "./SignDocumentSlice";
import { storage, updateDocumentToSign } from "../../firebase/firebase";
import { selectUser } from "../../firebase/firebaseSlice";
import WebViewer from "@pdftron/webviewer";
import "gestalt/dist/gestalt.css";
import "./SignDocument.css";
import documentApi from "../../api/documentApi";

const SignDocument = () => {
  const [annotManager, setAnnotatManager] = useState(null);
  const [annotPosition, setAnnotPosition] = useState(0);

  const doc = useSelector(selectDocToSign);
  const user = useSelector(selectUser);
  // const { docRef, docId } = doc;
  // const { email } = user;
  const email = "rrfpb.tuan2@inbox.testmail.app";
  const [documentId, setDocumentId] = useState();

  const location = useLocation();

  const signedObj = {
    document_xfds: [],
    contract_uuid: null,
    user_uuid: null,
  };

  const data = {
    document_xfdfs: [
      {
        xfdf: "string",
        document_uuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      },
    ],
    contract_uuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    user_uuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  };

  const viewer = useRef(null);
  useEffect(() => {
    const queryParam = new URLSearchParams(location.search);
    const r = queryParam.get("r");
    const c = queryParam.get("c");

    console.log("Use")
    COL
    const getInfo = async () => {
      try {
        const res = await documentApi.getSigning(c, r);
        console.log("Response get document: " + res);
        signedObj.contract_uuid = c;
        signedObj.user_uuid = r;
        //setDocumentId(res.data...);
        //signedObj.document_xfds.push({document_uuid: res.data})
      } catch (error) {
        console.log("Error on get info document: " + error.message);
      }
    };

    getInfo();
  }, []);

  useEffect(() => {
    WebViewer(
      {
        path: "webviewer",
        disabledElements: [
          "ribbons",
          "toggleNotesButton",
          "searchButton",
          "menuButton",
          "rubberStampToolGroupButton",
          "stampToolGroupButton",
          "fileAttachmentToolGroupButton",
          "calloutToolGroupButton",
          "undo",
          "redo",
          "eraserToolButton",
        ],
      },
      viewer.current
    ).then(async (instance) => {
      const { docViewer, annotManager, Annotations } = instance;
      setAnnotatManager(annotManager);

      // select only the insert group
      instance.setToolbarGroup("toolbarGroup-Insert");

      // load document
      const storageRef = storage.ref();
      const URL =
        "https://vtsign.blob.core.windows.net/document-dev/263b7c81-415f-478c-a1e4-d7af58b66cfd-Hop_dong_thue_nha_3.pdf"; //await storageRef.child(docRef).getDownloadURL();
      docViewer.loadDocument(URL);

      const normalStyles = (widget) => {
        if (widget instanceof Annotations.TextWidgetAnnotation) {
          return {
            "background-color": "#a5c7ff",
            color: "white",
          };
        } else if (widget instanceof Annotations.SignatureWidgetAnnotation) {
          return {
            border: "1px solid #a5c7ff",
          };
        }
      };

      annotManager.on(
        "annotationChanged",
        (annotations, action, { imported }) => {
          if (imported && action === "add") {
            annotations.forEach(function (annot) {
              if (annot instanceof Annotations.WidgetAnnotation) {
                Annotations.WidgetAnnotation.getCustomStyles = normalStyles;
                if (!annot.fieldName.startsWith(email)) {
                  annot.Hidden = true;
                  annot.Listable = false;
                }
              }
            });
          }
        }
      );
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
    signedObj.document_xfdfs.push({
      xfdf,
      document_uuid: documentId,
    });

    documentApi.signByReceiver(signedObj);

    // await updateDocumentToSign(docId, email, xfdf);
    navigate("/");
  };

  return (
    <div className={"prepareDocument"}>
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
