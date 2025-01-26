import React, { useState, useEffect, useReducer, useContext } from "react";
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
import Grid from "@material-ui/core/Grid";

// Importando ícones da biblioteca Lucide
import { Search, Trash, Edit, User } from "lucide-react";

// Primeiro, importe o SearchIcon do Material-UI
import SearchIcon from "@material-ui/icons/Search";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import whatsappIcon from '../../assets/images/nopicture.png'

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";
import UserStatusIcon from "../../components/UserModal/statusIcon";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Avatar } from "@material-ui/core";

const backendUrl = getBackendUrl();

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
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
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    border: "none",
    boxShadow: "none",
    backgroundColor: theme.palette.type === "light" ? "#FFFFFF" : "#232d45"
  },
  header: {
    width: "99.6%",
    marginTop: "40px",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  headerTitle: {
    marginRight: theme.spacing(2),
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    fontWeight: "bold",
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
  searchInput: {
    width: "100%",
    padding: "8px 12px 8px 35px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#28334e",
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    outline: "none"
  },
  tableContainer: {
    borderRadius: 8,
    padding: theme.spacing(2),
  },
  userAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  tableHead: {
    "& .MuiTableCell-head": {
      color: "#444",
      fontWeight: "bold",
    },
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  },
  tableHeader: {
    "& .MuiTableCell-root": {
      textTransform: "uppercase",
      fontWeight: "400",
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
      fontSize: "0.875rem",
    }
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
  searchIcon: {
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    opacity: 0.5
  },
  title: {
    color: "var(--title-color) !important",
    "& span": {
      color: "var(--title-color) !important"
    }
  },
}));

const Users = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const { user: loggedInUser } = useContext(AuthContext)
  const { profileImage } = loggedInUser;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam, pageNumber },
          });
          
          dispatch({ type: "LOAD_USERS", payload: data.users });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = loggedInUser.companyId;
    const socket = socketConnection({ companyId, userId: loggedInUser.id });

    socket.on(`company-${companyId}-user`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
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

  const renderProfileImage = (user) => {
    if (user.id === loggedInUser.id) {
      return (
        <Avatar
          src={`${backendUrl}/public/company${user.companyId}/user/${profileImage ? profileImage : whatsappIcon}`}
          alt={user.name}
          className={classes.userAvatar}
        />
      );
    }
    if (user.id !== loggedInUser.id) {
      return (
        <Avatar
          src={user.profileImage ? `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}` : whatsappIcon}
          alt={user.name}
          className={classes.userAvatar}
        />
      );
    }
    return <User />;
  };
  
  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingUser && `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name}`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%", marginTop: "40px" }} container>
          <Grid xs={12} sm={8} item>
            <Title className={classes.title}>
              {i18n.t("users.title")} ({users.length})
            </Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={6} sm={6} item>
                <div className="relative" style={{ width: "100%", position: "relative" }}>
                  <input
                    type="text"
                    value={searchParam}
                    onChange={handleSearch}
                    placeholder={i18n.t("contacts.searchPlaceholder")}
                    className={classes.searchInput}
                  />
                  <div style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                    zIndex: 1
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
                  variant="contained"
                  onClick={handleOpenUserModal}
                  className={classes.addButton}
                >
                  {i18n.t("users.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        onScroll={handleScroll}
      >
        <div className={classes.tableContainer}>
          <Table size="small" className={classes.table}>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell align="center">{i18n.t("users.table.ID")}</TableCell>
                <TableCell align="center">{i18n.t("users.table.status")}</TableCell>
                <TableCell align="center">Avatar</TableCell>
                <TableCell align="center">{i18n.t("users.table.name")}</TableCell>
                <TableCell align="center">{i18n.t("users.table.email")}</TableCell>
                <TableCell align="center">{i18n.t("users.table.profile")}</TableCell>
                <TableCell align="center">{i18n.t("users.table.startWork")}</TableCell>
                <TableCell align="center">{i18n.t("users.table.endWork")}</TableCell>
                <TableCell align="center">{i18n.t("users.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className={classes.tableRow}>
                  <TableCell align="center">{user.id}</TableCell>
                  <TableCell align="center"><UserStatusIcon user={user} /></TableCell>
                  <TableCell align="center">
                    <div className={classes.avatarDiv}>
                      {renderProfileImage(user)}
                    </div>
                  </TableCell>
                  <TableCell align="center">{user.name}</TableCell>
                  <TableCell align="center">{user.email}</TableCell>
                  <TableCell align="center">{user.profile}</TableCell>
                  <TableCell align="center">{user.startWork}</TableCell>
                  <TableCell align="center">{user.endWork}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditUser(user)}
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
                        setConfirmModalOpen(true);
                        setDeletingUser(user);
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
              {loading && <TableRowSkeleton columns={9} />}
            </TableBody>
          </Table>
        </div>
      </Paper>
    </MainContainer>
  );
};

export default Users;