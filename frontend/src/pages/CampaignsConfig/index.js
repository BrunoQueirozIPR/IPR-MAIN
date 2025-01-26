import React, { useEffect, useState, useContext} from "react";
import { Field } from "formik";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { Trash, Plus, Settings } from "lucide-react";
import api from "../../services/api";
import usePlans from "../../hooks/usePlans";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import ConfirmationModal from "../../components/ConfirmationModal";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    border: "none",
    boxShadow: "none",
    backgroundColor: theme.palette.type === "light" ? "#FFFFFF" : "#232d45",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  textRight: {
    textAlign: "right"
  },
  tabPanelsContainer: {
    padding: theme.padding,
    width: "90%",
    maxWidth: "1000px",
    margin: "20px auto",
    "& .MuiGrid-container": {
      maxWidth: "100%",
      margin: "0 auto"
    }
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },
  formControl: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#28334e",
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    },
    "& .MuiSelect-root": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    }
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.type === "light" ? "#F5F5F5" : "#28334e",
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    },
    "& .MuiOutlinedInput-input": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    }
  },
  tableContainer: {
    "& .MuiTableCell-root": {
      color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
      borderColor: theme.palette.type === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.1)"
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      fontWeight: "bold",
      textTransform: "uppercase"
    }
  },
  button: {
    backgroundColor: "#065f46 !important",
    color: "#fff !important",
    borderRadius: "8px",
    textTransform: "none",
    padding: "8px 20px"
  },
  closeButton: {
    backgroundColor: "#991b1b !important",
    color: "#fff !important",
    borderRadius: "8px",
    textTransform: "none",
    padding: "8px 20px"
  },
  addBlueButton: {
    backgroundColor: "#0d4f91 !important",
    color: "#fff !important",
    borderRadius: "8px",
    textTransform: "none",
    padding: "8px 20px"
  },
  outlinedButton: {
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF" + " !important",
    borderRadius: "8px",
    textTransform: "none",
    padding: "8px 20px",
    borderColor: theme.palette.type === "light" 
      ? "rgba(53, 69, 103, 0.5) !important"  // Cor da borda no modo claro
      : "rgba(255, 255, 255, 0.5) !important" // Cor da borda no modo escuro
  },
  title: {
    color: theme.palette.type === "light" ? "#354567" : "#FFFFFF",
    marginBottom: "16px"
  },
  mainHeaderContent: {
    maxWidth: "1000px",
    margin: "0 auto",
    width: "90%",
    "& .MuiGrid-container": {
      justifyContent: "center"
    }
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 20px",
    padding: "20px 0"
  }
}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
  // sabado: "false",
  // domingo: "false",
  // startHour: "09:00",
  // endHour: "18:00"
};

const CampaignsConfig = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });
  const { user } = useContext(AuthContext);

  // const [sabado, setSabado] = React.useState(false);
  // const [domingo, setDomingo] = React.useState(false);

  // const [startHour, setStartHour] = useState("08:00");
  // const [endHour, setEndHour] = useState("19:00");

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
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
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, JSON.parse(item.value)]);
        });
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success("Configurações salvas");
  };

  // const handleChange = (event) => {
  //   if (event.target.name === "sabado") {
  //     setSabado(event.target.checked);
  //   }
  //   if (event.target.name === "domingo") {
  //     setDomingo(event.target.checked);
  //   }
  // };

  // const handleSaveTimeMass = async () => {
  //   let settings = {
  //     sabado: sabado,
  //     domingo: domingo,
  //     startHour: startHour,
  //     endHour: endHour
  //   }

  //   try {
  //     await api.post(`/campaign-settings/`, { settings });

  //     toast.success(i18n.t("settings.success"));
  //   } catch (err) {
  //     toastError(err);
  //   }
  // };

  return (
    <MainContainer>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <div className={classes.mainHeaderContent}>
          <Grid style={{ marginTop: "40px" }} container>
            <Grid xs={12} item>
              <Title>{i18n.t("campaignsConfig.title")}</Title>
            </Grid>
          </Grid>
        </div>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.contentWrapper}>
          <Box className={classes.tabPanelsContainer}>
            <Grid spacing={1} container>
              <Grid xs={12} item>
                <Typography component={"h1"} style={{ 
                  color: theme.palette.type === "light" ? "#354567" : "#FFFFFF" 
                }}>
                  Intervalos &nbsp;
                </Typography>
              </Grid>

              {/* TEMPO ENTRE DISPAROS */}
              {/* <Grid xs={12} md={3} item>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="messageInterval-label">
                    Tempo entre Disparos
                  </InputLabel>
                  <Select
                    name="messageInterval"
                    id="messageInterval"
                    labelId="messageInterval-label"
                    label="Intervalo Randômico de Disparo"
                    value={settings.messageInterval}
                    onChange={(e) => handleOnChangeSettings(e)}
                  >
                    <MenuItem value={0}>Sem Intervalo</MenuItem>
                    <MenuItem value={5}>5 segundos</MenuItem>
                    <MenuItem value={10}>10 segundos</MenuItem>
                    <MenuItem value={15}>15 segundos</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}

              <Grid xs={12} md={3} item>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="messageInterval-label">
                    {i18n.t("campaigns.settings.randomInterval")}
                  </InputLabel>
                  <Select
                    name="messageInterval"
                    id="messageInterval"
                    labelId="messageInterval-label"
                    label={i18n.t("campaigns.settings.randomInterval")}
                    value={settings.messageInterval}
                    onChange={(e) => handleOnChangeSettings(e)}
                  >
                    <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                    <MenuItem value={5}>5 segundos</MenuItem>
                    <MenuItem value={10}>10 segundos</MenuItem>
                    <MenuItem value={15}>15 segundos</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={3} item>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="longerIntervalAfter-label">
                  {i18n.t("campaigns.settings.intervalGapAfter")}
                  </InputLabel>
                  <Select
                    name="longerIntervalAfter"
                    id="longerIntervalAfter"
                    labelId="longerIntervalAfter-label"
                    label={i18n.t("campaigns.settings.intervalGapAfter")}
                    value={settings.longerIntervalAfter}
                    onChange={(e) => handleOnChangeSettings(e)}
                  >
                    <MenuItem value={0}>{i18n.t("campaigns.settings.undefined")}</MenuItem>
                    <MenuItem value={5}>5 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={10}>10 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={15}>15 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={20}>20 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={3} item>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="greaterInterval-label">
                  {i18n.t("campaigns.settings.laggerTriggerRange")}
                  </InputLabel>
                  <Select
                    name="greaterInterval"
                    id="greaterInterval"
                    labelId="greaterInterval-label"
                    label={i18n.t("campaigns.settings.laggerTriggerRange")}
                    value={settings.greaterInterval}
                    onChange={(e) => handleOnChangeSettings(e)}
                  >
                    <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                    <MenuItem value={30}>30 segundos</MenuItem>
                    <MenuItem value={40}>40 segundos</MenuItem>
                    <MenuItem value={50}>50 segundos</MenuItem>
                    <MenuItem value={60}>60 segundos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} className={classes.textRight} item>
                <Button
                  onClick={() => setShowVariablesForm(!showVariablesForm)}
                  color="primary"
                  variant="outlined"
                  className={classes.outlinedButton}
                  style={{ marginRight: 10 }}
                >
                  {i18n.t("campaigns.settings.addVar")}
                </Button>
                <Button
                  onClick={saveSettings}
                  color="primary"
                  variant="contained"
                  className={classes.button}
                >
                  {i18n.t("campaigns.settings.save")}
                </Button>
              </Grid>
              {showVariablesForm && (
                <>
                  <Grid xs={12} md={6} item>
                    <TextField
                      label={i18n.t("campaigns.settings.shortcut")}
                      variant="outlined"
                      value={variable.key}
                      name="key"
                      onChange={handleOnChangeVariable}
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>
                  <Grid xs={12} md={6} item>
                    <TextField
                      label={i18n.t("campaigns.settings.content")}
                      variant="outlined"
                      value={variable.value}
                      name="value"
                      onChange={handleOnChangeVariable}
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} className={classes.textRight} item>
                    <Button
                      onClick={() => setShowVariablesForm(!showVariablesForm)}
                      color="primary"
                      variant="contained"
                      className={classes.closeButton}
                      style={{ marginRight: 10 }}
                    >
                      {i18n.t("campaigns.settings.close")}
                    </Button>
                    <Button
                      onClick={addVariable}
                      color="primary"
                      variant="contained"
                      className={classes.addBlueButton}
                    >
                      {i18n.t("campaigns.settings.add")}
                    </Button>
                  </Grid>
                </>
              )}
              {settings.variables.length > 0 && (
                <Grid xs={12} className={classes.textRight} item>
                  <Table size="small" className={classes.tableContainer}>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "1%" }}></TableCell>
                        <TableCell>{i18n.t("campaigns.settings.shortcut")}
                        </TableCell>
                        <TableCell>{i18n.t("campaigns.settings.content")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(settings.variables) &&
                        settings.variables.map((v, k) => (
                          <TableRow key={k}>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedKey(v.key);
                                  setConfirmationOpen(true);
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
                            <TableCell>{"{" + v.key + "}"}</TableCell>
                            <TableCell>{v.value}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Grid>
              )}
            </Grid>
          </Box>
        </div>
      </Paper>
    </MainContainer>
  );
};

export default CampaignsConfig;
