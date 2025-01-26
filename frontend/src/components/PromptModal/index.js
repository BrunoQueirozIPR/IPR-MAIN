import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../../components/QueueSelectSingle";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#2f3b54",
      borderRadius: "8px",
      color: "#fff",
      "& fieldset": {
        border: "none",
      },
      "&:hover": {
        backgroundColor: "rgba(47, 59, 84, 0.9)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#fff",
    },
    "& .MuiFormHelperText-root": {
      color: "#fff",
      opacity: 0.7,
    },
  },
  dialogContent: {
    backgroundColor: "#202c45",
    color: "#fff",
    padding: theme.spacing(2),
  },
  dialogTitle: {
    backgroundColor: "#202c45",
    color: "#fff",
    "& .MuiTypography-root": {
      fontSize: "1.2rem",
      fontWeight: "bold",
    },
  },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#2f3b54",
      borderRadius: "8px",
      color: "#fff",
      "& fieldset": {
        border: "none",
      },
      "&:hover": {
        backgroundColor: "rgba(47, 59, 84, 0.9)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#fff",
    },
    "& .MuiSelect-icon": {
      color: "#fff",
    },
  },
  select: {
    width: "100%",
    marginBottom: theme.spacing(1),
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#2f3b54",
      borderRadius: "8px",
      color: "#fff",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#fff",
    },
    "& .MuiSelect-icon": {
      color: "#fff",
    },
  },
  menuItem: {
    backgroundColor: "#2f3b54 !important",
    color: "#fff !important",
    "&:hover": {
      backgroundColor: "rgba(47, 59, 84, 0.9) !important",
    },
    "&.Mui-selected": {
      backgroundColor: "#14708f !important",
    },
  },
  saveButton: {
    backgroundColor: "#14708f !important",
    color: "#fff !important",
    borderRadius: "8px",
    textTransform: "none",
    padding: "8px 22px",
    "&:hover": {
      backgroundColor: "rgba(20, 112, 143, 0.9) !important",
    },
  },
  closeButton: {
    backgroundColor: "#7f1d1d !important",
    color: "#fff !important",
    borderRadius: "8px",
    textTransform: "none",
    padding: "8px 22px",
    "&:hover": {
      backgroundColor: "rgba(127, 29, 29, 0.9) !important",
    },
  },
  dialogActions: {
    backgroundColor: "#202c45",
    padding: theme.spacing(2),
    justifyContent: "space-between",
  },
  multFieldLine: {
    display: "flex",
    gap: "16px",
    marginBottom: theme.spacing(2),
    "& .MuiFormControl-root": {
      flex: 1,
    }
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
}));

const PromptSchema = Yup.object().shape({
  name: Yup.string().min(5, "Muito curto!").max(100, "Muito longo!").required("Obrigatório"),
  prompt: Yup.string().min(50, "Muito curto!").required("Descreva o treinamento para Inteligência Artificial"),
  voice: Yup.string().required("Informe o modo para Voz"),
  max_tokens: Yup.number().required("Informe o número máximo de tokens"),
  temperature: Yup.number().required("Informe a temperatura"),
  apikey: Yup.string().required("Informe a API Key"),
  queueId: Yup.number().required("Informe a fila"),
  max_messages: Yup.number().required("Informe o número máximo de mensagens")
});

const PromptModal = ({ open, onClose, promptId }) => {
  const classes = useStyles();
  const [selectedVoice, setSelectedVoice] = useState("texto");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleToggleApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const initialState = {
    name: "",
    prompt: "",
    voice: "texto",
    voiceKey: "",
    voiceRegion: "",
    maxTokens: 100,
    temperature: 1,
    apiKey: "",
    queueId: null,
    maxMessages: 10
  };

  const [prompt, setPrompt] = useState(initialState);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId) {
        setPrompt(initialState);
        return;
      }
      try {
        const { data } = await api.get(`/prompt/${promptId}`);
        setPrompt(prevState => {
          return { ...prevState, ...data };
        });
        setSelectedVoice(data.voice);
      } catch (err) {
        toastError(err);
      }
    };

    fetchPrompt();
  }, [promptId, open]);

  const handleClose = () => {
    setPrompt(initialState);
    setSelectedVoice("texto");
    onClose();
  };

  const handleChangeVoice = (e) => {
    setSelectedVoice(e.target.value);
  };

  const handleSavePrompt = async values => {
    const promptData = { ...values, voice: selectedVoice };
    if (!values.queueId) {
      toastError("Informe o setor");
      return;
    }
    try {
      if (promptId) {
        await api.put(`/prompt/${promptId}`, promptData);
      } else {
        await api.post("/prompt", promptData);
      }
      toast.success(i18n.t("promptModal.success"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        scroll="paper"
        classes={{ paper: classes.dialogContent }}
      >
        <DialogTitle className={classes.dialogTitle}>
          {promptId
            ? `${i18n.t("promptModal.title.edit")}`
            : `${i18n.t("promptModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={prompt}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSavePrompt(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form style={{ width: "100%" }}>
              <DialogContent dividers>
                <Field
                  as={TextField}
                  label={i18n.t("promptModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  style={{ margin: '10px 0' }}
                />
                <FormControl fullWidth margin="dense" variant="outlined" className={classes.formControl} style={{ margin: '10px 0' }}>
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.apikey")}
                    name="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    error={touched.apiKey && Boolean(errors.apiKey)}
                    helperText={touched.apiKey && errors.apiKey}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleToggleApiKey}>
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    style={{ margin: '10px 0' }}
                  />
                </FormControl>
                 <Field
                  as={TextField}
                  label={i18n.t("promptModal.form.prompt")}
                  name="prompt"
                  error={touched.prompt && Boolean(errors.prompt)}
                  helperText={touched.prompt && errors.prompt}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  rows={10}
                  multiline={true}
                  className={classes.textField}
                  style={{ margin: '10px 0' }}
                />
                <QueueSelectSingle 
                  className={classes.formControl} 
                  style={{ margin: '10px 0' }} 
                />
                <div className={classes.multFieldLine}>
                  <FormControl 
                    variant="outlined" 
                    className={classes.formControl}
                    style={{ margin: '10px 0', flex: 1 }}
                  >
                    <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                    <Select
                      id="type-select"
                      name="voice"
                      value={selectedVoice}
                      onChange={handleChangeVoice}
                      multiple={false}
                      className={classes.select}
                    >
                      <MenuItem key={"texto"} value={"texto"} className={classes.menuItem}>
                        Texto
                      </MenuItem>
                      <MenuItem key={"pt-BR-FranciscaNeural"} value={"pt-BR-FranciscaNeural"} className={classes.menuItem}>
                        Francisa
                      </MenuItem>
                      <MenuItem key={"pt-BR-AntonioNeural"} value={"pt-BR-AntonioNeural"} className={classes.menuItem}>
                        Antônio
                      </MenuItem>
                      <MenuItem key={"pt-BR-BrendaNeural"} value={"pt-BR-BrendaNeural"} className={classes.menuItem}>
                        Brenda
                      </MenuItem>
                      <MenuItem key={"pt-BR-DonatoNeural"} value={"pt-BR-DonatoNeural"} className={classes.menuItem}>
                        Donato
                      </MenuItem>
                      <MenuItem key={"pt-BR-ElzaNeural"} value={"pt-BR-ElzaNeural"} className={classes.menuItem}>
                        Elza
                      </MenuItem>
                      <MenuItem key={"pt-BR-FabioNeural"} value={"pt-BR-FabioNeural"} className={classes.menuItem}>
                        Fábio
                      </MenuItem>
                      <MenuItem key={"pt-BR-GiovannaNeural"} value={"pt-BR-GiovannaNeural"} className={classes.menuItem}>
                        Giovanna
                      </MenuItem>
                      <MenuItem key={"pt-BR-HumbertoNeural"} value={"pt-BR-HumbertoNeural"} className={classes.menuItem}>
                        Humberto
                      </MenuItem>
                      <MenuItem key={"pt-BR-JulioNeural"} value={"pt-BR-JulioNeural"} className={classes.menuItem}>
                        Julio
                      </MenuItem>
                      <MenuItem key={"pt-BR-LeilaNeural"} value={"pt-BR-LeilaNeural"} className={classes.menuItem}>
                        Leila
                      </MenuItem>
                      <MenuItem key={"pt-BR-LeticiaNeural"} value={"pt-BR-LeticiaNeural"} className={classes.menuItem}>
                        Letícia
                      </MenuItem>
                      <MenuItem key={"pt-BR-ManuelaNeural"} value={"pt-BR-ManuelaNeural"} className={classes.menuItem}>
                        Manuela
                      </MenuItem>
                      <MenuItem key={"pt-BR-NicolauNeural"} value={"pt-BR-NicolauNeural"} className={classes.menuItem}>
                        Nicolau
                      </MenuItem>
                      <MenuItem key={"pt-BR-ValerioNeural"} value={"pt-BR-ValerioNeural"} className={classes.menuItem}>
                        Valério
                      </MenuItem>
                      <MenuItem key={"pt-BR-YaraNeural"} value={"pt-BR-YaraNeural"} className={classes.menuItem}>
                        Yara
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.voiceKey")}
                    name="voiceKey"
                    error={touched.voiceKey && Boolean(errors.voiceKey)}
                    helperText={touched.voiceKey && errors.voiceKey}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    style={{
                      margin: '10px 0',
                      height: '56px', // Ajuste para tornar o campo mais alto
                    }}
                    InputProps={{
                      style: {
                        height: '100%', // Garante que o conteúdo interno ocupe toda a altura
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.voiceRegion")}
                    name="voiceRegion"
                    error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                    helperText={touched.voiceRegion && errors.voiceRegion}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    style={{
                      margin: '10px 0',
                      height: '56px', // Ajuste para tornar o campo mais alto
                    }}
                    InputProps={{
                      style: {
                        height: '100%', // Garante que o conteúdo interno ocupe toda a altura
                      },
                    }}
                  />
                </div>

                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.temperature")}
                    name="temperature"
                    error={touched.temperature && Boolean(errors.temperature)}
                    helperText={touched.temperature && errors.temperature}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    style={{
                      margin: '10px 0',
                      height: '56px', // Ajuste para tornar o campo mais alto
                    }}
                    InputProps={{
                      style: {
                        height: '100%', // Garante que o conteúdo interno ocupe toda a altura
                      },
                    }}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.max_tokens")}
                    name="maxTokens"
                    error={touched.maxTokens && Boolean(errors.maxTokens)}
                    helperText={touched.maxTokens && errors.maxTokens}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    style={{
                      margin: '10px 0',
                      height: '56px', // Ajuste para tornar o campo mais alto
                    }}
                    InputProps={{
                      style: {
                        height: '100%', // Garante que o conteúdo interno ocupe toda a altura
                      },
                    }}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.max_messages")}
                    name="maxMessages"
                    error={touched.maxMessages && Boolean(errors.maxMessages)}
                    helperText={touched.maxMessages && errors.maxMessages}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                    style={{
                      margin: '10px 0',
                      height: '56px', // Ajuste para tornar o campo mais alto
                    }}
                    InputProps={{
                      style: {
                        height: '100%', // Garante que o conteúdo interno ocupe toda a altura
                      },
                    }}
                  />
                </div>
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  disabled={isSubmitting}
                  className={classes.closeButton}
                >
                  {i18n.t("promptModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  className={classes.saveButton}
                >
                  {promptId
                    ? `${i18n.t("promptModal.buttons.okEdit")}`
                    : `${i18n.t("promptModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default PromptModal;