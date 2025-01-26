import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import { Add, ClearAllRounded, DoneAll, Facebook, Group, Instagram, OfflineBolt, WhatsApp } from "@material-ui/icons";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MessageSharpIcon from "@material-ui/icons/MessageSharp";
import ClockIcon from "@material-ui/icons/AccessTime";
import IconButton from '@material-ui/core/IconButton';

import FilterListIcon from '@material-ui/icons/FilterList';

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid"

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";

import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import { StatusFilter } from "../StatusFilter";
import { WhatsappsFilter } from "../WhatsappsFilter";
import api from "../../services/api";
import { Button, Snackbar } from "@material-ui/core";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: theme.mode === "dark" ? "#28334e" : "#f2f2f2",
    padding: "10px 0",
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    borderRadius: "8px", // Para manter bordas arredondadas
    margin: "0 12px 12px", // Inclui margin-bottom
    padding: "8px 12px", // Espaçamento interno padrão
    position: "relative",
    transition: "all 0.3s ease", // Animação suave para mudanças visuais
    "&:hover": {
      backgroundColor: "#0f172a",
      color: "#fff",
      transition: "all .2s ease",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 9,
        left: 9,
        right: 3,
        bottom: 3,
        backgroundColor: "#0f172a",
        borderRadius: "8px",
        zIndex: -1
      }
    },
    "&.Mui-selected": {
      backgroundColor: "#0f172a !important",
      color: "#fff !important",
    }
  },

  snackbar: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    borderRadius: 30,
  },

  yesButton: {
    backgroundColor: '#FFF',
    color: 'rgba(0, 100, 0, 1)',
    padding: '4px 4px',
    fontSize: '1em',
    fontWeight: 'bold',
    // textTransform: 'uppercase',
    marginRight: theme.spacing(1),
    '&:hover': {
      backgroundColor: 'darkGreen',
      color: '#FFF',
    },
    borderRadius: 30,
  },
  noButton: {
    backgroundColor: '#FFF',
    color: 'rgba(139, 0, 0, 1)',
    padding: '4px 4px',
    fontSize: '1em',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'darkRed',
      color: '#FFF',
    },
    borderRadius: 30,
  },

  tabPanelItem: {
    minWidth: 120,
    fontSize: 11,
    marginLeft: 0,
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.mode === "dark" ? "#28334e" : "#f2f2f2",
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    backgroundColor: theme.mode === "dark" ? "#0f172a" : "#fff",
    display: "flex",
    borderRadius: 8,
    padding: 4,
    margin: "40px 20px 25px 20px", 
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 6,
    color: theme.mode === "dark" ? "#fff" : "#000",
  },

  badge: {
    // right: "-10px",
  },

  customBadge: {
    right: "-10px",
    backgroundColor: "#f44336",
    color: "#fff",
  },

  show: {
    display: "block",
  },

  hide: {
    display: "none !important",
  },

  speedDial: {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
  },

  filterContainer: {
    backgroundColor: theme.mode === "dark" ? "#0f172a" : "#f2f2f2",
    margin: "0 20px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "& > *": {
      marginBottom: "10px",
      backgroundColor: theme.mode === "dark" ? "#0f172a" : "#fff",
      borderRadius: "6px",
      padding: "8px",
      width: "100%",
      height: "45px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none"
      },
      "& .MuiSelect-outlined": {
        border: "none"
      },
      "& .MuiFormControl-root": {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& fieldset": {
          border: "none"
        }
      },
      "& .MuiInputBase-root": {
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& input": {
          textAlign: "center"
        }
      },
      "& .MuiSelect-root": {
        width: "100%",
        textAlign: "center"
      },
      "& .MuiAutocomplete-root": {
        width: "100%",
        "& .MuiInputBase-root": {
          width: "100%",
          "& input": {
            textAlign: "center"
          }
        }
      }
    }
  },

  queueSelect: {
    backgroundColor: theme.mode === "dark" ? "#354567" : "#fff",
    borderRadius: "6px",
    padding: "8px",
    height: "45px",
    margin: "0 20px",
    "& .MuiSelect-root": {
      height: "100%",
      display: "flex",
      alignItems: "center",
      textAlign: "center"
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none"
    },
    "& .MuiSelect-select": {
      border: "none"
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        border: "none"
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: "none"
      }
    }
  },
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupingCount, setGroupingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  // const [forceSearch, setForceSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [filter, setFilter] = useState(false);
  // const [open, setOpen] = useState(false);
  // const [hidden, setHidden] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedQueuesMessage(selectedQueueIds);
  }, []);
  // }, [selectedQueueIds]);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
    // setForceSearch(!forceSearch)
  }, []);


  let searchTimeout;

  const handleSearch = e => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  // const handleBack = useCallback(() => {
  //   history.push("/tickets");
  // },[history]);

  const handleSnackbarOpen = useCallback(() => {
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = status => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const CloseAllTicket = async () => {
    try {
      const { data } = await api.post("/tickets/closeAll", { status: tabOpen, queueIds: selectedQueueIds });
      handleSnackbarClose();
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const tooltipTitleStyle = {
    fontSize: '10px'
  };

  const handleCloseOrOpenTicket = ticket => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = selecteds => {
    const tags = selecteds.map(t => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map(t => t.id);
    setSelectedUsers(users);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);

    setSelectedStatus(statusFilter);
  };

  const handleFilter = () => {
    console.log("entrou no filter")
    if (filter) {
      setFilter(false);
      setTab("open")
    }
    else
      setFilter(true);
    setTab("search")
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      className={classes.ticketsWrapper}
    >
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={i18n.t("ticketsManager.questionCloseTicket")}
        ContentProps={{
          className: classes.snackbar,
        }}
        action={
          <>
            <Button className={classes.yesButton} size="small" onClick={CloseAllTicket}>
              {i18n.t("ticketsManager.yes")}
            </Button>
            <Button className={classes.noButton} size="small" onClick={handleSnackbarClose}>
              {i18n.t("ticketsManager.not")}
            </Button>
          </>
        }
      />

      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <div className={classes.serachInputWrapper}>
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          className={classes.searchInput}
          inputRef={searchInputRef}
          placeholder={i18n.t("tickets.search.placeholder")}
          type="search"
          onChange={handleSearch}
        />
        <IconButton color="primary"
          aria-label="upload picture"
          component="span"
          onClick={handleFilter}
        >
          <FilterListIcon />
        </IconButton>
      </div>

      {filter === true && (
        <div className={classes.filterContainer}>
          <TagsFilter onFiltered={handleSelectedTags} />
          <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
          <StatusFilter onFiltered={handleSelectedStatus} />
          {profile === "admin" && (
            <UsersFilter onFiltered={handleSelectedUsers} />
          )}
        </div>
      )}

      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            label="Abertas"
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            label="Resolvidos"
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"search"}
            label="Busca"
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <>
          <Can
            role={user.profile}
            perform="tickets-manager:showall"
            yes={() => (
              <FormControlLabel
                label={i18n.t("tickets.buttons.showAll")}
                labelPlacement="start"
                control={
                  <Switch
                    size="small"
                    checked={showAllTickets}
                    onChange={() =>
                      setShowAllTickets((prevState) => !prevState)
                    }
                    name="showAllTickets"
                    color="primary"
                  />
                }
              />
            )}
          />
          <SpeedDial
            ariaLabel="Menu Actions"
            className={classes.speedDial}
            size="small"
            icon={<OfflineBolt />}
          >
            {user.profile === 'admin' && (
              <SpeedDialAction
                icon={<DoneAll style={{ color: 'green' }} />}
                tooltipTitle={<span style={tooltipTitleStyle}>{i18n.t("ticketsManager.buttons.close")}&nbsp;Todos</span>}
                tooltipOpen
                onClick={(event) => {
                  // handleClosed();
                  handleSnackbarOpen();
                }}
              />
            )}
            <SpeedDialAction
              icon={<Add style={{ color: '#25D366' }} />}
              tooltipTitle={<span style={tooltipTitleStyle}>{i18n.t("ticketsManager.buttons.new")}&nbsp;Ticket</span>}
              tooltipOpen
              onClick={() => {
                // handleClosed();
                setNewTicketModalOpen(true);
              }}
            />
          </SpeedDial>
        </>
        <TicketsQueueSelect
          className={classes.queueSelect}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => {
            setSelectedQueueIds(values);
          }}
        />
      </Paper>
      <TabPanel
        value={tab}
        name="open"
        className={classes.ticketsWrapper}
      >
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >

          {/* ATENDENDO */}
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    className={classes.badge}
                    badgeContent={openCount}
                    color="primary"
                  >
                    <MessageSharpIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.assignedHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"open"}
            classes={{ root: classes.tabPanelItem }}
          />

          {/* AGUARDANDO */}
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={pendingCount}
                    color="primary"
                  >
                    <ClockIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.pendingHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"pending"}
            classes={{ root: classes.tabPanelItem }}
          />

          {/* GRUPOS */}
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={groupingCount}
                    color="primary"
                  >
                    <Group
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.groupingHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"group"}
            classes={{ root: classes.tabPanelItem }}
          />
        </Tabs>

        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
            forceSearch={false}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            showAll={user.profile === "admin" ? showAllTickets : false}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
            forceSearch={false}

          />
          <TicketsList
            status="group"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setGroupingCount(val)}
            style={applyPanelStyle("group")}
            forceSearch={false}

          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
        // handleChangeTab={handleChangeTabOpen}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        {profile === "admin" && (
          <>
            <TicketsList
              statusFilter={selectedStatus}
              searchParam={searchParam}
              showAll={showAllTickets}
              tags={selectedTags}
              users={selectedUsers}
              selectedQueueIds={selectedQueueIds}
              whatsappIds={selectedWhatsapp}
              forceSearch={true}
              status="search"
            />
          </>
        )}

        {profile === "user" && (
          <TicketsList
            statusFilter={selectedStatus}
            searchParam={searchParam}
            showAll={false}
            tags={selectedTags}
            selectedQueueIds={selectedQueueIds}
            whatsappIds={selectedWhatsapp}
            forceSearch={true}
            status="search"
          />
        )}
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
