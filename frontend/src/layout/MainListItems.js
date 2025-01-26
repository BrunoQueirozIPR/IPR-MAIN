import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import * as Icons from "lucide-react";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import {Badge, Collapse, List } from "@material-ui/core";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { socketConnection } from "../services/socket";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem dense button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props, { collapsed }) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openKanbanSubmenu, setOpenKanbanSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const history = useHistory();

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);

  const { getPlanCompany } = usePlans();

  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
     async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setShowIntegration(planConfigs.plan.useIntegration);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink
            to="/"
            primary="Dashboard"
            icon={<Icons.Home size={24} color="#cbd5e1" strokeWidth={1.5} />}
          />
        )}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<Icons.MessageCircle size={24} color="#cbd5e1" strokeWidth={1.5} />}
      />

      { <ListItemLink
          to="/connections"
          primary={i18n.t("mainDrawer.listItems.connections")}
          icon={
            <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
              <Icons.Repeat size={24} color="#cbd5e1" strokeWidth={1.5} />
            </Badge>
          }
        /> }

        <ListItemLink
          to="/quick-messages"
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          icon={<Icons.Zap size={24} color="#cbd5e1" strokeWidth={1.5} />}
        />

      {showKanban && (
        <>
          <ListItem
            dense
            button
            onClick={() => setOpenKanbanSubmenu((prev) => !prev)}
          >
            <ListItemIcon>
              <Icons.Layout color="#cbd5e1" strokeWidth={1.5} />
            </ListItemIcon>
            <ListItemText
              primary={i18n.t("mainDrawer.listItems.kanban")}
            />
            {openKanbanSubmenu ? (
              <Icons.ChevronUp color="#cbd5e1" strokeWidth={1.5} />
            ) : (
              <Icons.ChevronDown color="#cbd5e1" strokeWidth={1.5} />
            )}
          </ListItem>
              <Collapse
                style={{ paddingLeft: 15 }}
                in={openKanbanSubmenu}
                timeout="auto"
                unmountOnExit
              >
            <List dense component="div" disablePadding>
              <ListItem onClick={() => history.push("/kanban")} button>
                <ListItemIcon>
                  <Icons.Grid color="#cbd5e1" strokeWidth={1.5} size={20} />
                </ListItemIcon>
                <ListItemText primary={i18n.t("kanban.subMenus.list")} />
              </ListItem>
              <ListItem onClick={() => history.push("/tagsKanban")} button>
                <ListItemIcon>
                  <Icons.Calendar color="#cbd5e1" strokeWidth={1.5} size={20} />
                </ListItemIcon>
                <ListItemText primary={i18n.t("kanban.subMenus.tags")} />
               </ListItem>
            </List>
          </Collapse>
        </>
      )}


      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<Icons.PhoneCall color="#cbd5e1" strokeWidth={1.5} size={24} />}
      />  

      {showSchedules && (
        <>
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<Icons.Calendar color="#cbd5e1" strokeWidth={1.5} size={24} />}
          />
        </>
      )}

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<Icons.Tag color="#cbd5e1" strokeWidth={1.5} size={24} />}
      />

      {showInternalChat && (
        <>
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="secondary" variant="dot" invisible={invisible}>
                <Icons.MessageSquare color="#cbd5e1" strokeWidth={1.5} size={24} />
              </Badge>
            }
          />
        </>
      )}

      <ListItemLink
        to="/helps"
        primary={i18n.t("mainDrawer.listItems.helps")}
        icon={<Icons.HelpCircle color="#cbd5e1" strokeWidth={1.5} size={24} />}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            {showCampaigns && (
              <>
                <ListItem
                  dense
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                >
                  <ListItemIcon>
                    <Icons.Calendar color="#cbd5e1" strokeWidth={1.5} size={24} />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                  />
                  {openCampaignSubmenu ? (
                    <Icons.ChevronUp color="#cbd5e1" strokeWidth={1.5} size={24} />
                  ) : (
                    <Icons.ChevronDown color="#cbd5e1" strokeWidth={1.5} size={24} />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List dense component="div" disablePadding>
                    <ListItem onClick={() => history.push("/campaigns")} button>
                      <ListItemIcon>
                        <Icons.List color="#cbd5e1" strokeWidth={1.5} size={24} />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("campaigns.subMenus.list")} />
                    </ListItem>
                    <ListItem onClick={() => history.push("/contact-lists")} button>
                      <ListItemIcon>
                        <Icons.Users color="#cbd5e1" strokeWidth={1.5} size={24} />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("campaigns.subMenus.listContacts")} />
                    </ListItem>
                    <ListItem onClick={() => history.push("/campaigns-config")} button>
                      <ListItemIcon>
                        <Icons.Settings color="#cbd5e1" strokeWidth={1.5} size={24} />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("campaigns.subMenus.settings")} />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                  icon={<Icons.Megaphone color="#cbd5e1" strokeWidth={1.5} size={24} />}
              />
            )}

            {/* {showExternalApi && (
              // <>
              //   <ListItemLink
              //     to="/announcements"
              //     primary={i18n.t("mainDrawer.listItems.annoucements")}
              //     icon={<Icons.Bell color="#cbd5e1" strokeWidth={1.5} size={24} />}
              //   />
              // </>
            )} */}

              <ListItemLink
                to="/users"
                primary={i18n.t("mainDrawer.listItems.users")}
                icon={<Icons.Users color="#cbd5e1" strokeWidth={1.5} size={24} />}
              />
              <ListItemLink
                to="/queues"
                primary={i18n.t("mainDrawer.listItems.queues")}
                icon={<Icons.Layers color="#cbd5e1" strokeWidth={1.5} size={24} />}
              />

            {showOpenAi && ( 
              <>
                <ListItemLink
                  to="/prompts"
                  primary={i18n.t("mainDrawer.listItems.prompts")}
                  icon={<Icons.Infinity color="#cbd5e1" strokeWidth={1.5} size={24} />}
                />
              </>
            )} 

            { showIntegration && 
              (<>
                <ListItemLink
                  to="/queue-integration"
                  primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                  icon={<Icons.Network color="#cbd5e1" strokeWidth={1.5} size={24} />}
                />
              </>
            )}

              <ListItemLink
                to="/connections"
                primary={i18n.t("mainDrawer.listItems.connections")}
                icon={
                  <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                    <Icons.RefreshCcw color="#cbd5e1" strokeWidth={1.5} size={24} />
                  </Badge>
                }
              />

            <ListItemLink
              to="/files"
              primary={i18n.t("mainDrawer.listItems.files")}
              icon={<Icons.Paperclip color="#cbd5e1" strokeWidth={1.5} size={24} />}
            />

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<Icons.Settings color="#cbd5e1" strokeWidth={1.5} size={24} />}
            />

            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<Icons.Building color="#cbd5e1" strokeWidth={1.5} size={24} />}
              />
            )}

            {!collapsed && <React.Fragment>
              <Divider />
            </React.Fragment>
            }


          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
