import React, { useEffect, useReducer, useState } from "react";

import openSocket from "socket.io-client";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import PromptModal from "../../components/PromptModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";

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
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 8px",
  },
  headerContainer: {
    marginTop: theme.spacing(2),
    width: "96%",
    margin: "0 auto",
  },
  tableHeader: {
    textTransform: "uppercase",
    fontWeight: 400,
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    "& .MuiTableCell-root": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
      padding: theme.spacing(1),
      border: "none",
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
    marginBottom: "8px",
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
  title: {
    color: "var(--title-color) !important",
    "& span": {
      color: "var(--title-color) !important"
    }
  }
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];

    prompts.forEach((prompt) => {
      const promptIndex = state.findIndex((p) => p.id === prompt.id);
      if (promptIndex !== -1) {
        state[promptIndex] = prompt;
      } else {
        newPrompts.push(prompt);
      }
    });

    return [...state, ...newPrompts];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const promptIndex = state.findIndex((p) => p.id === prompt.id);

    if (promptIndex !== -1) {
      state[promptIndex] = prompt;
      return [...state];
    } else {
      return [prompt, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const promptId = action.payload;
    const promptIndex = state.findIndex((p) => p.id === promptId);
    if (promptIndex !== -1) {
      state.splice(promptIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Prompts = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [prompts, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompt");
        dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

    socket.on("prompt", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenPromptModal = () => {
    setPromptModalOpen(true);
    setSelectedPrompt(null);
  };

  const handleClosePromptModal = () => {
    setPromptModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      const { data } = await api.delete(`/prompt/${promptId}`);
      toast.info(i18n.t(data.message));
    } catch (err) {
      toastError(err);
    }
    setSelectedPrompt(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedPrompt &&
          `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeletePrompt(selectedPrompt.id)}
      >
        {i18n.t("prompts.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <PromptModal
        open={promptModalOpen}
        onClose={handleClosePromptModal}
        promptId={selectedPrompt?.id}
      />
      <div className={classes.headerContainer}>
        <MainHeader>
          <Title className={classes.title}>
            {i18n.t("prompts.title")}
          </Title>
          <MainHeaderButtonsWrapper>
            <Button
              variant="contained"
              className={classes.addButton}
              onClick={handleOpenPromptModal}
            >
              {i18n.t("prompts.buttons.add")}
            </Button>
          </MainHeaderButtonsWrapper>
        </MainHeader>
      </div>
      <Paper className={classes.mainPaper}>
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableHeader}>
              <TableCell align="left">
                {i18n.t("prompts.table.name")}
              </TableCell>
              <TableCell align="left">
                {i18n.t("prompts.table.queue")}
              </TableCell>
              <TableCell align="left">
                {i18n.t("prompts.table.max_tokens")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("prompts.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {prompts.map((prompt) => (
                <TableRow key={prompt.id} className={classes.tableRow}>
                  <TableCell align="left">{prompt.name}</TableCell>
                  <TableCell align="left">{prompt.queue.name}</TableCell>
                  <TableCell align="left">{prompt.maxTokens}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditPrompt(prompt)}
                    >
                      <Edit style={{ 
                        color: theme.palette.type === "light" ? "#354567" : "#FFFFFF" 
                      }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline style={{ 
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

export default Prompts;
