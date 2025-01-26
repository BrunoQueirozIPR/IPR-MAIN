import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import { Trash, Edit, Search } from "lucide-react";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import AnnouncementModal from "../../components/AnnouncementModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex(
          (u) => u.id === announcement.id
        );
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    } else {
      return [announcement, ...state];
    }
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcementId = action.payload;

    const announcementIndex = state.findIndex((u) => u.id === announcementId);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
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
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF"
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
  addButton: {
    width: "80%",
    backgroundColor: "#065f46 !important",
    color: "#fff !important",
    borderRadius: "8px",
    textTransform: "none",
    padding: "8px 20px",
    height: "38px",
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px 8px 35px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#28334e",
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    outline: "none"
  },
  searchIcon: {
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    opacity: 0.5
  },
  title: {
    color: "var(--title-color) !important",
    "& span": {
      color: "var(--title-color) !important"
    }
  }
}));

const Announcements = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);

  // trava para nao acessar pagina que não pode  
  useEffect(() => {
    async function fetchData() {
      if (!user.super) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company-announcement`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(true);
  };

  const handleCloseAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = async (announcement) => {
    try {
      if (announcement.mediaName)
      await api.delete(`/announcements/${announcement.id}/media-upload`);

      await api.delete(`/announcements/${announcement.id}`);
      
      toast.success(i18n.t("announcements.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingAnnouncement(null);
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

  const translatePriority = (val) => {
    if (val === 1) {
      return "Alta";
    }
    if (val === 2) {
      return "Média";
    }
    if (val === 3) {
      return "Baixa";
    }
  };

  return (
    <MainContainer >
      <ConfirmationModal
        title={
          deletingAnnouncement &&
          `${i18n.t("announcements.confirmationModal.deleteTitle")} ${deletingAnnouncement.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteAnnouncement(deletingAnnouncement)}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <AnnouncementModal
        resetPagination={() => {
          setPageNumber(1);
          fetchAnnouncements();
        }}
        open={announcementModalOpen}
        onClose={handleCloseAnnouncementModal}
        aria-labelledby="form-dialog-title"
        announcementId={selectedAnnouncement && selectedAnnouncement.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%", marginTop: "40px" }} container>
          <Grid xs={12} sm={8} item>
            <Title>
              <span className={classes.titleHeader}>
                {i18n.t("announcements.title")} ({announcements.length})
              </span>
            </Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={6} sm={6} item>
                <div className="relative" style={{ width: "100%" }}>
                  <input
                    type="text"
                    value={searchParam}
                    onChange={handleSearch}
                    placeholder={i18n.t("campaigns.searchPlaceholder")}
                    className={classes.searchInput}
                  />
                  <div style={{
                    top: "50%",
                    marginTop: "-15px",
                    marginLeft: "8px",
                    cursor: "pointer",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none"
                  }}>
                    <Search 
                      size={20}
                      className={classes.searchIcon}
                    />
                  </div>
                </div>
              </Grid>
              <Grid xs={6} sm={6} item>
                <Button
                  fullWidth
                  variant="contained"
                  className={classes.addButton}
                  onClick={handleOpenAnnouncementModal}
                  id="newAnnouncement-button"
                >
                  {i18n.t("announcements.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <div className={classes.contentWrapper}>
          <Table size="small" className={classes.tableContainer}>
            <TableHead>
              <TableRow className={classes.tableHeader}>
                <TableCell align="center">
                  {i18n.t("announcements.table.title")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.priority")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.mediaName")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.status")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id} className={classes.tableRow}>
                    <TableCell align="center">{announcement.title}</TableCell>
                    <TableCell align="center">
                      {translatePriority(announcement.priority)}
                    </TableCell>
                    <TableCell align="center">
                      {announcement.mediaName ?? i18n.t("quickMessages.noAttachment")}
                    </TableCell>
                    <TableCell align="center">
                      {announcement.status ? i18n.t("announcements.active") : i18n.t("announcements.inactive")}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditAnnouncement(announcement)}
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
                          setDeletingAnnouncement(announcement);
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
                {loading && <TableRowSkeleton columns={5} />}
              </>
            </TableBody>
          </Table>
        </div>
      </Paper>
    </MainContainer >
  )
};

export default Announcements;
