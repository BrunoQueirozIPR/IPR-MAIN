import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { socketConnection } from "../../services/socket";
import n8n from "../../assets/images/n8n.png";
import dialogflow from "../../assets/images/dialogflow.png";
import webhooks from "../../assets/images/webhook.png"
import typebot from "../../assets/images/typebot.jpg";
import { useHistory } from "react-router-dom";
import { Edit, Trash } from "lucide-react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Avatar,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Grid
} from "@material-ui/core";
import { Search } from "lucide-react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];

    queueIntegration.forEach((integration) => {
      const integrationIndex = state.findIndex((u) => u.id === integration.id);
      if (integrationIndex !== -1) {
        state[integrationIndex] = integration;
      } else {
        newIntegrations.push(integration);
      }
    });

    return [...state, ...newIntegrations];
  }

  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const integrationIndex = state.findIndex((u) => u.id === queueIntegration.id);

    if (integrationIndex !== -1) {
      state[integrationIndex] = queueIntegration;
      return [...state];
    } else {
      return [queueIntegration, ...state];
    }
  }

  if (action.type === "DELETE_INTEGRATION") {
    const integrationId = action.payload;

    const integrationIndex = state.findIndex((u) => u.id === integrationId);
    if (integrationIndex !== -1) {
      state.splice(integrationIndex, 1);
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
    overflowY: "scroll",
    backgroundColor: theme.palette.type === "light" ? "#FFFFFF" : "#232d45",
    ...theme.scrollbarStyles,
    border: "none",
    boxShadow: "none",
    width: "96%",
    margin: "16px auto",
  },
  contentWrapper: {
    width: "90%",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px 0"
  },
  tableContainer: {
    width: "100%",
    borderSpacing: "0 16px",
    borderCollapse: "separate"
  },
  tableRow: {
    backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#2f3b54",
    "& .MuiTableCell-root": {
      padding: "16px 8px",
      border: "none",
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    },
    "&:hover": {
      backgroundColor: theme.palette.type === "light" ? "#E8E8E8" : "#2f3b54"
    },
    marginBottom: "16px",
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
  tableHeader: {
    "& .MuiTableCell-root": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
      fontWeight: "400 !important",
      textTransform: "uppercase"
    }
  },
  avatar: {
    width: "140px",
    height: "40px",
    borderRadius: 4
  },
  addButton: {
    width: "100%",
    backgroundColor: "#065f46 !important",
    color: "#ffffff !important",
    textTransform: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    height: "48px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    height: "38px",
  },
  searchInput: {
    width: "80%",
    height: "38px",
    padding: "8px 12px 8px 35px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#28334e",
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    outline: "none",
  },
  searchContainer: {
    position: "relative",
    width: "100%",
    height: "38px",
  },
  searchIcon: {
    position: "absolute",
    left: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1
  },
  title: {
    color: "var(--title-color) !important",
    "& span": {
      color: "var(--title-color) !important"
    }
  }
}));

const QueueIntegration = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [queueIntegration, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchIntegrations = async () => {
        try {
          const { data } = await api.get("/queueIntegration/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchIntegrations();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company-${companyId}-queueIntegration`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenUserModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditIntegration = (queueIntegration) => {
    setSelectedIntegration(queueIntegration);
    setUserModalOpen(true);
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
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
        title={
          deletingUser &&
          `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingUser.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteIntegration(deletingUser.id)}
      >
        {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <IntegrationModal
        open={userModalOpen}
        onClose={handleCloseIntegrationModal}
        aria-labelledby="form-dialog-title"
        integrationId={selectedIntegration && selectedIntegration.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%", marginTop: "40px" }} container>
          <Grid xs={12} sm={8} item>
            <Title className={classes.title}>
              <span>{i18n.t("queueIntegration.title")} ({queueIntegration.length})</span>
            </Title>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <div className={classes.searchContainer}>
                  <div className={classes.searchIcon}>
                    <Search 
                      size={20}
                      style={{ 
                        color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
                        opacity: 0.5 
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={searchParam}
                    onChange={handleSearch}
                    placeholder={i18n.t("queueIntegration.searchPlaceholder")}
                    className={classes.searchInput}
                  />
                </div>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  className={classes.addButton}
                  onClick={handleOpenUserModal}
                >
                  {i18n.t("queueIntegration.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <div className={classes.contentWrapper}>
          <Table size="small" className={classes.tableContainer}>
            <TableHead>
              <TableRow className={classes.tableHeader}>
                <TableCell padding="checkbox"></TableCell>
                <TableCell align="center">{i18n.t("queueIntegration.table.id")}</TableCell>
                <TableCell align="center">{i18n.t("queueIntegration.table.name")}</TableCell>
                <TableCell align="center">{i18n.t("queueIntegration.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {queueIntegration.map((integration) => (
                  <TableRow key={integration.id} className={classes.tableRow}>
                    <TableCell>
                      {integration.type === "dialogflow" && (<Avatar src={dialogflow} className={classes.avatar} />)}
                      {integration.type === "n8n" && (<Avatar src={n8n} className={classes.avatar} />)}
                      {integration.type === "webhook" && (<Avatar src={webhooks} className={classes.avatar} />)}
                      {integration.type === "typebot" && (<Avatar src={typebot} className={classes.avatar} />)}
                    </TableCell>
                    <TableCell align="center">{integration.id}</TableCell>
                    <TableCell align="center">{integration.name}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditIntegration(integration)}
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
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingUser(integration);
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

export default QueueIntegration;