import React, {
    useState,
    useEffect,
    useReducer,
    useCallback,
    useContext,
} from "react";
import { toast } from "react-toastify";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import FileModal from "../../components/FileModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
    if (action.type === "LOAD_FILES") {
        const files = action.payload;
        const newFiles = [];

        files.forEach((fileList) => {
            const fileListIndex = state.findIndex((s) => s.id === fileList.id);
            if (fileListIndex !== -1) {
                state[fileListIndex] = fileList;
            } else {
                newFiles.push(fileList);
            }
        });

        return [...state, ...newFiles];
    }

    if (action.type === "UPDATE_FILES") {
        const fileList = action.payload;
        const fileListIndex = state.findIndex((s) => s.id === fileList.id);

        if (fileListIndex !== -1) {
            state[fileListIndex] = fileList;
            return [...state];
        } else {
            return [fileList, ...state];
        }
    }

    if (action.type === "DELETE_TAG") {
        const fileListId = action.payload;

        const fileListIndex = state.findIndex((s) => s.id === fileListId);
        if (fileListIndex !== -1) {
            state.splice(fileListIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
        backgroundColor: theme.palette.type === "light" ? "#FFFFFF" : "#232d45",
        border: "none",
        boxShadow: "none",
        width: "96%",
        margin: "16px auto",
    },
    tableContainer: {
        width: "100%",
        borderSpacing: "0 8px",
        borderCollapse: "separate",
    },
    tableHeader: {
        "& .MuiTableCell-root": {
            color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
            fontWeight: "400",
            textTransform: "uppercase",
            borderBottom: "none",
        }
    },
    tableRow: {
        backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#2f3b54",
        "& .MuiTableCell-root": {
            padding: "8px",
            border: "none",
            color: theme.palette.type === "light" ? "#354567" : "#FFFFFF"
        },
        "&:hover": {
            backgroundColor: theme.palette.type === "light" ? "#E8E8E8" : "#2f3b54"
        },
        borderRadius: "8px",
        "& td:first-child": {
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px"
        },
        "& td:last-child": {
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px"
        }
    },
    searchInput: {
        background: theme.palette.type === "light" ? "#F5F5F5" : "#28334e",
        border: "none",
        borderRadius: "8px",
        padding: "8px 12px",
        color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    },
    addButton: {
        width: "100%",
        backgroundColor: "#065f46 !important",
        color: "#ffffff !important",
        textTransform: "none",
        padding: "8px 20px",
        borderRadius: "8px",
        height: "38px",
    },
    title: {
        color: "var(--title-color) !important",
        "& span": {
            color: "var(--title-color) !important"
        }
    }
}));

const FileLists = () => {
    const classes = useStyles();
    const theme = useTheme();

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedFileList, setSelectedFileList] = useState(null);
    const [deletingFileList, setDeletingFileList] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [files, dispatch] = useReducer(reducer, []);
    const [fileListModalOpen, setFileListModalOpen] = useState(false);

    const fetchFileLists = useCallback(async () => {
        try {
            const { data } = await api.get("/files/", {
                params: { searchParam, pageNumber },
            });
            dispatch({ type: "LOAD_FILES", payload: data.files });
            setHasMore(data.hasMore);
            setLoading(false);
        } catch (err) {
            toastError(err);
        }
    }, [searchParam, pageNumber]);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            fetchFileLists();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, fetchFileLists]);

    useEffect(() => {
        const socket = socketConnection({ companyId: user.companyId });

        socket.on(`company-${user.companyId}-file`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_FILES", payload: data.files });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_USER", payload: +data.fileId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleOpenFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(true);
    };

    const handleCloseFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditFileList = (fileList) => {
        setSelectedFileList(fileList);
        setFileListModalOpen(true);
    };

    const handleDeleteFileList = async (fileListId) => {
        try {
            await api.delete(`/files/${fileListId}`);
            toast.success(i18n.t("files.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingFileList(null);
        setSearchParam("");
        setPageNumber(1);

        dispatch({ type: "RESET" });
        setPageNumber(1);
        await fetchFileLists();
    };

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={deletingFileList && `${i18n.t("files.confirmationModal.deleteTitle")}`}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteFileList(deletingFileList.id)}
            >
                {i18n.t("files.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <FileModal
                open={fileListModalOpen}
                onClose={handleCloseFileListModal}
                reload={fetchFileLists}
                aria-labelledby="form-dialog-title"
                fileListId={selectedFileList && selectedFileList.id}
            />
            <MainHeader>
                <Title className={classes.title}>
                    {i18n.t("files.title")} ({files.length})
                </Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder={i18n.t("contacts.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        className={classes.searchInput}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ 
                                        color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
                                        opacity: 0.5 
                                    }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        className={classes.addButton}
                        onClick={handleOpenFileListModal}
                    >
                        {i18n.t("files.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small" className={classes.tableContainer}>
                    <TableHead>
                        <TableRow className={classes.tableHeader}>
                            <TableCell align="center">{i18n.t("files.table.name")}</TableCell>
                            <TableCell align="center">
                                {i18n.t("files.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {files.map((fileList) => (
                                <TableRow key={fileList.id} className={classes.tableRow}>
                                    <TableCell align="center">
                                        {fileList.name}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleEditFileList(fileList)}>
                                            <EditIcon style={{ 
                                                color: theme.palette.type === "light" ? "#354567" : "#FFFFFF" 
                                            }} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setConfirmModalOpen(true);
                                                setDeletingFileList(fileList);
                                            }}
                                        >
                                            <DeleteOutlineIcon style={{ 
                                                color: theme.palette.type === "light" ? "#354567" : "#FFFFFF" 
                                            }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={4} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default FileLists;
