import React, { useEffect, useReducer, useState, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { Trash, Edit } from "lucide-react";
import QueueModal from "../../components/QueueModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  headerContainer: {
    marginTop: theme.spacing(2),
    width: "96%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 auto",
  },
  header: {
    width: "99.6%",
    marginTop: "40px",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  
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
    "& .MuiTypography-root": {
      width: "150px",
      textAlign: "center",
    }
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
  tableHeader: {
    textTransform: "uppercase",
    fontWeight: 400,
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
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
  tableContainer: {
    minWidth: "800px",
    maxWidth: "100%",
    overflowX: "auto",
  },
  tableCellContent: {
    padding: theme.spacing(1),
    marginBottom: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "120px",
  },
  title: {
    color: "var(--title-color) !important",
    "& span": {
      color: "var(--title-color) !important"
    }
  }
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];

    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });

    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);

    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    const queueIndex = state.findIndex((q) => q.id === queueId);
    if (queueIndex !== -1) {
      state.splice(queueIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company-${companyId}-queue`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success(i18n.t("Queue deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("queues.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QueueModal
        open={queueModalOpen}
        onClose={handleCloseQueueModal}
        queueId={selectedQueue?.id}
        onEdit={(res) => {
          if (res) {
            setTimeout(() => {
              handleEditQueue(res)
            }, 500)
          }
        }}
      />
      <div className={classes.headerContainer}>
        <Title className={classes.title}>
          {i18n.t("queues.title")} ({queues.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            className={classes.addButton}
            onClick={handleOpenQueueModal}
          >
            {i18n.t("queues.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </div>
      <Paper className={classes.mainPaper}>
        <div className={classes.tableContainer}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" className={classes.tableHeader}>
                  {i18n.t("queues.table.ID")}
                </TableCell>
                <TableCell align="center" className={classes.tableHeader}>
                  {i18n.t("queues.table.name")}
                </TableCell>
                <TableCell align="center" className={classes.tableHeader}>
                  {i18n.t("queues.table.color")}
                </TableCell>
                <TableCell align="center" className={classes.tableHeader}>
                  {i18n.t("queues.table.orderQueue")}
                </TableCell>
                <TableCell align="center" className={classes.tableHeader}>
                  {i18n.t("queues.table.greeting")}
                </TableCell>
                <TableCell align="center" className={classes.tableHeader}>
                  {i18n.t("queues.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {queues.map((queue) => (
                  <TableRow key={queue.id} className={classes.tableRow}>
                    <TableCell align="center">
                      <div className={classes.tableCellContent}>
                        {queue.id}
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.tableCellContent}>
                        {queue.name}
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.customTableCell}>
                        <span
                          style={{
                            backgroundColor: queue.color,
                            width: 20,
                            height: 20,
                            alignSelf: "center",
                            borderRadius: "5px",
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.customTableCell}>
                        <Typography
                          style={{ width: 300, align: "center" }}
                          noWrap
                          variant="body2"
                        >
                          {queue.orderQueue}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.customTableCell}>
                        <Typography
                          style={{ width: 300, align: "center" }}
                          noWrap
                          variant="body2"
                        >
                          {queue.greetingMessage}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditQueue(queue)}
                      >
                        <Edit 
                          size={20} 
                          style={{ 
                            color: theme.palette.type === "light" ? "#354567" : "#FFFFFF" 
                          }} 
                        />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedQueue(queue);
                          setConfirmModalOpen(true);
                        }}
                      >
                        <Trash 
                          size={20} 
                          style={{ 
                            color: theme.palette.type === "light" ? "#354567" : "#FFFFFF" 
                          }} 
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={4} />}
              </>
            </TableBody>
          </Table>
        </div>
      </Paper>
    </MainContainer>
  );
};

export default Queues;
