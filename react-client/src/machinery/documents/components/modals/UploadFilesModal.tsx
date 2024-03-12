import Machinery from "../../../../machinery-management/interfaces/Machinery";
import React, { useContext, useEffect, useState } from "react";
import type FileMap from "../../interfaces/FileMap";
import documentsService from "../../../../services/DocumentService";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  Badge,
  ButtonGroup,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { FiFile, FiTrash } from "react-icons/fi";
import { LuFileLock2, LuFile } from "react-icons/lu";
import toastHelper from "../../../../utils/ToastHelper";
import ToastContext from "../../../../utils/contexts/ToastContext";
import axiosExceptionHandler from "../../../../utils/AxiosExceptionHandler";
import PrincipalContext from "../../../../utils/contexts/PrincipalContext";
import HelperFunctions from "../../../../utils/HelperFunctions";

interface UploadFilesModalProps {
  machinery: Machinery;
  uploadFilesModalOpen: boolean;
  setUploadFilesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fileMap: FileMap;
  setFileMap: React.Dispatch<React.SetStateAction<FileMap>>;
  parentFolderID: string;
}

export default function UploadFilesModal(props: UploadFilesModalProps) {
  const { machinery, uploadFilesModalOpen, setUploadFilesModalOpen, fileMap, setFileMap, parentFolderID } = props;

  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);

  const [isDragging, setIsDragging] = useState(false);

  const [numErrors, setNumErrors] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [doUpload, setDoUpload] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  // UPLOAD FILES
  useEffect(() => {
    if (!doUpload) return;

    async function upload() {
      setIsUploading(true);

      try {
        const formData = new FormData();
        for (const file of selectedFiles)
          if (!file.name.endsWith(".pdf")) {
            const newFile = JSON.parse(JSON.stringify(file));
            newFile.name += ".pdf";
            formData.append("files", newFile);
          } else formData.append("files", file);
        formData.append("parentFolderPath", parentFolderID);
        const uploadedFiles = await documentsService.uploadMachineryDocuments(machinery.uid, formData, isPrivate);

        setFileMap((val) => {
          const newChildrenIds: string[] = [];

          selectedFiles.forEach((selectedFile) => {
            if (uploadedFiles.find((el) => el.name === selectedFile.name) == null) return;

            const uploadedFile = uploadedFiles.find((el) => el.name === selectedFile.name);
            if (uploadedFile != null) {
              const id = `${parentFolderID}\\${uploadedFile.name}`;
              val[id] = {
                childrenCount: 0,
                childrenIds: [],
                id,
                documentUID: uploadedFile.documentUID,
                isDir: false,
                isDocument: true,
                isModifiable: true,
                modDate: new Date(uploadedFile.modificationTimestamp),
                name: uploadedFile.name,
                parentId: parentFolderID,
                size: selectedFile.size,
                isPrivate: uploadedFile.isPrivate,
                isArol: Number(principal?.companyID) === 0,
              };

              newChildrenIds.push(id);
            }
          });

          const currentFolder = { ...val[parentFolderID] };
          currentFolder.childrenIds = [...currentFolder.childrenIds, ...newChildrenIds];
          currentFolder.childrenCount += newChildrenIds.length;

          val[parentFolderID] = currentFolder;

          return { ...val };
        });

        if (uploadedFiles.length !== selectedFiles.length)
          toastHelper.makeToast(
            toast,
            `${uploadedFiles.length} out of ${selectedFiles.length} files uploaded`,
            "warning",
          );
        else toastHelper.makeToast(toast, "All files successfully uploaded", "success");

        setUploadFilesModalOpen(false);
      } catch (e) {
        console.error(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Files could not be uploaded");
      }

      setDoUpload(false);
      setIsUploading(false);
    }

    upload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doUpload, machinery.uid, parentFolderID, props, selectedFiles, setFileMap, setUploadFilesModalOpen]);

  // UPLOAD BUTTON CLICKED
  function handleUploadClicked() {
    setDoUpload(true);
  }

  // CLOSE MODAL
  function handleClose() {
    setUploadFilesModalOpen(false);
  }

  // FILES ADDED FOR UPLOAD
  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFiles((val) => {
      if (e.target.files == null) return val;

      const files = e.target.files;
      const filesArray: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file && file.type === "application/pdf") filesArray.push(file);
      }

      return [...val, ...filesArray];
    });
  }

  // FILES DROPPED FOR UPLOAD
  function handleFilesDropped(e: React.DragEvent<HTMLInputElement>) {
    setSelectedFiles((val) => {
      if (!e.dataTransfer.files) return val;

      const files = e.dataTransfer.files;
      const filesArray: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file && file.type === "application/pdf") filesArray.push(file);
      }

      return [...val, ...filesArray];
    });
  }

  // HANDLE DRAG ENTER
  function handleOnDragEnter() {
    setIsDragging(true);
  }

  // HANDLE DRAG LEAVE
  function handleOnDragLeave() {
    setIsDragging(false);
  }

  return (
    <Modal isOpen={uploadFilesModalOpen} size="3xl" onClose={handleClose}>
      <ModalOverlay onMouseDown={(e) => e.stopPropagation()} />
      <ModalContent onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader fontSize={"28px"}>Upload documents</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack w="full" alignItems="left">
            <Text fontWeight={"semibold"} pb={3}>
              {Number(principal?.companyID) === 0
                ? "This file will be available for you and company members"
                : "This file is private by default and will not be available for AROL, you can change this setting after uploading a file"}
            </Text>

            <VStack
              w="full"
              h="200px"
              bgColor="gray.100"
              rounded="xl"
              justifyContent="center"
              alignItems="center"
              position="relative"
            >
              <FiFile size={50} />
              {isDragging ? (
                <Text fontSize="md" fontWeight={300} mt="0!important">
                  Drop here
                </Text>
              ) : (
                <>
                  <Text fontSize="md" fontWeight={650} pt={4}>
                    Drag & Drop PDF documents here
                  </Text>
                  <Text fontSize="md" fontWeight={300} mt="0!important">
                    or click to select
                  </Text>
                </>
              )}
              <Input
                type="file"
                height="full"
                width="full"
                position="absolute"
                top="0"
                left="0"
                opacity="0"
                aria-hidden="true"
                accept=".pdf"
                _hover={{ cursor: "pointer" }}
                onChange={(e) => handleFilesSelected(e)}
                onDrop={handleFilesDropped}
                onDragEnter={handleOnDragEnter}
                onDragLeave={handleOnDragLeave}
                multiple
              />
            </VStack>
            <VStack w="full" alignItems="left">
              {selectedFiles.map((file, index) => (
                <FileEntry
                  key={index}
                  file={file}
                  index={index}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  setNumErrors={setNumErrors}
                  fileMap={fileMap}
                  parentFolderID={parentFolderID}
                  setIsPrivate={setIsPrivate}
                  isPrivate={isPrivate}
                  num_files={selectedFiles.length}
                />
              ))}
              {selectedFiles.length === 0 && (
                <Box w="full" textAlign="center" mt={2}>
                  <Text>No files selected</Text>
                </Box>
              )}
            </VStack>
          </VStack>
          {selectedFiles.length > 1 && Number(principal?.companyID) !== 0 && (
            <Box mt={8}>
              <Flex direction={"row"} gap={5}>
                <Text color="gray.600" fontWeight={"bold"} pt={1}>
                  Set privacy for all files:
                </Text>
                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button width={20} onClick={() => setIsPrivate((val) => !val)}>
                    {isPrivate ? "Public" : "Private"}
                  </Button>
                  <IconButton
                    style={{ pointerEvents: "none" }}
                    aria-label="file-privacy"
                    icon={isPrivate ? <LuFile /> : <LuFileLock2 />}
                  />
                </ButtonGroup>
              </Flex>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={handleClose}>
            Close
          </Button>
          <Button
            colorScheme="blue"
            isDisabled={selectedFiles.length === 0 || numErrors > 0}
            isLoading={isUploading}
            loadingText="Uploading"
            onClick={handleUploadClicked}
          >
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface FileEntryProps {
  file: File;
  index: number;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setNumErrors: React.Dispatch<React.SetStateAction<number>>;
  fileMap: FileMap;
  parentFolderID: string;
  setIsPrivate: React.Dispatch<React.SetStateAction<boolean>>;
  isPrivate: boolean;
  num_files: number;
}

function FileEntry(props: FileEntryProps) {
  const {
    file,
    index,
    selectedFiles,
    setSelectedFiles,
    fileMap,
    parentFolderID,
    setNumErrors,
    setIsPrivate,
    isPrivate,
    num_files,
  } = props;

  const { principal } = useContext(PrincipalContext);

  const [fileName, setFileName] = useState(file.name.endsWith(".pdf") ? file.name.slice(0, -4) : file.name);
  const [fileNameError, setFileNameError] = useState<string>("");

  // CHECK FOR ERRORS IN FILE NAME
  useEffect(() => {
    if (fileName.trim().length === 0) {
      setFileNameError((val) => {
        if (val.length === 0) setNumErrors((el) => el + 1);

        return "File name cannot be empty";
      });

      return;
    }

    const completeFilename = `${fileName}.pdf`;
    if (
      selectedFiles.find((el, ind) => index !== ind && el.name === completeFilename) != null ||
      Object.values(fileMap).find((el: any) => el.parentId === parentFolderID && el.name === completeFilename) != null
    ) {
      setFileNameError((val) => {
        if (val.length === 0) setNumErrors((el) => el + 1);

        return "A file with the same name already exists";
      });

      return;
    }

    setFileNameError((val) => {
      if (val.length > 0) setNumErrors((el) => el - 1);

      return "";
    });
  }, [fileMap, fileName, index, parentFolderID, props, selectedFiles, setNumErrors]);

  // HANDLE FILE NAME CHANGED
  function handleFileNameChanged(newFileName: string) {
    setFileName(newFileName);

    setSelectedFiles((val) => {
      val[index] = new File([val[index]], `${newFileName}.pdf`, { type: val[index].type });
      return val;
    });
  }

  return (
    <>
      <HStack w="full" h="fit-content">
        <HStack w="full" justifyContent="space-between" alignItems="baseline" pr={3}>
          <FormControl isInvalid={fileNameError.length > 0}>
            <InputGroup maxW="500px" size="sm">
              <Input value={fileName} onChange={(e) => handleFileNameChanged(e.target.value)} />
              <InputRightAddon>.pdf</InputRightAddon>
            </InputGroup>
            {fileNameError && <FormErrorMessage>{fileNameError}</FormErrorMessage>}
          </FormControl>
          <Box ml={4}>
            <Badge colorScheme={Number(principal?.companyID) !== 0 && isPrivate ? "blue" : "green"}>
              {Number(principal?.companyID) !== 0 && isPrivate ? "Private" : "Public"}
            </Badge>
          </Box>
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap" minW={"60px"}>
            {HelperFunctions.formatFileSize(file.size)}
          </Text>
        </HStack>
        <HStack h="full" alignItems="center">
          {num_files === 1 && Number(principal?.companyID) !== 0 && (
            <>
              <Divider orientation="vertical" h="32px" />
              <Box _hover={{ cursor: "pointer" }} onClick={() => setIsPrivate((val) => !val)}>
                {isPrivate ? <LuFileLock2 /> : <LuFile />}
              </Box>{" "}
            </>
          )}
          <Divider orientation="vertical" h="32px" />
          <Box
            _hover={{ cursor: "pointer" }}
            onClick={() => setSelectedFiles((val) => val.filter((file, ind) => ind !== index))}
          >
            <FiTrash />
          </Box>
        </HStack>
      </HStack>
      <Divider orientation="horizontal" />
    </>
  );
}
