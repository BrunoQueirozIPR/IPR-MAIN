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
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import { Search, Trash2, Edit, Users, Download } from "lucide-react";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";

import planilhaExemplo from "../../assets/planilha.xlsx";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
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
    ...theme.scrollbarStyles,
    border: "none",
    boxShadow: "none",
    backgroundColor: theme.palette.type === "light" ? "#FFFFFF" : "#232d45"
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
      textTransform: "uppercase",
      fontWeight: "400",
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF"
    }
  },
  searchInput: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#28334e",
      borderRadius: "8px",
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
      padding: "8px 12px 8px 35px",
      height: "38px",
      "& fieldset": {
        border: "none"
      }
    },
    "& .MuiOutlinedInput-input": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF"
    }
  },
  addButton: {
    backgroundColor: "#065f46 !important",
    color: "#fff !important",
    borderRadius: "8px",
    textTransform: "none",
    height: "38px",
    padding: "0 16px",
    float: "right"
  },
  table: {
    borderSpacing: "0 16px",
    borderCollapse: "separate"
  },
  searchIcon: {
    position: "relative",
    "& .MuiInputAdornment-root": {
      position: "absolute",
      left: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 1,
      pointerEvents: "none"
    }
  },
  actionButtons: {
    "& .MuiIconButton-root": {
      marginLeft: "10px",
      padding: "8px"
    },
    "& .MuiIconButton-root:first-child": {
      marginLeft: 0
    }
  }
}));

const ContactLists = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company-${companyId}-ContactList`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%", marginTop: "40px" }} container>
          <Grid xs={12} sm={8} item>
            <Title>{i18n.t("contactLists.title")}</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid container>
              <Grid xs={6} item>
                <div className={classes.searchIcon}>
                  <TextField
                    placeholder={i18n.t("contacts.searchPlaceholder")}
                    type="search"
                    value={searchParam}
                    onChange={handleSearch}
                    className={classes.searchInput}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search 
                            style={{ 
                              color: theme.palette.type === "light" ? "#354567" : "#FFFFFF", 
                              opacity: 0.5 
                            }} 
                            size={20} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </Grid>
              <Grid xs={6} item style={{ paddingRight: 0 }}>
                <Button
                  variant="contained"
                  className={classes.addButton}
                  onClick={handleOpenContactListModal}
                >
                  {i18n.t("contactLists.buttons.add")}
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
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableHeader}>
              <TableCell align="center">{i18n.t("contactLists.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("contactLists.table.contacts")}</TableCell>
              <TableCell align="center">{i18n.t("contactLists.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {contactLists.map((contactList) => (
                <TableRow key={contactList.id} className={classes.tableRow}>
                  <TableCell align="center">{contactList.name}</TableCell>
                  <TableCell align="center">{contactList.contactsCount || 0}</TableCell>
                  <TableCell align="center">
                    <div className={classes.actionButtons}>
                      <a href={planilhaExemplo} download="planilha.xlsx">
                        <IconButton size="small" title="Baixar Planilha Exemplo">
                          <Download size={20} />
                        </IconButton>
                      </a>

                      <IconButton
                        size="small"
                        onClick={() => goToContacts(contactList.id)}
                      >
                        <Users size={20} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleEditContactList(contactList)}
                      >
                        <Edit size={20} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingContactList(contactList);
                        }}
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ContactLists;
