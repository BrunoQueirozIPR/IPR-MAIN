import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  TextField,
  Grid,
  Paper,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#202c45",
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    backgroundColor: "#202c45",
    border: "none",
    boxShadow: "none",
  },
  textField: {
    marginRight: theme.spacing(1),
    marginBottom: "16px",
    flex: 1,
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
  btnLeft: {
    display: "flex",
    marginRight: "auto",
    marginLeft: 12,
    backgroundColor: "#065f46",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#065f46",
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    marginBottom: "16px",
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
  dialogContent: {
    backgroundColor: "#202c45",
    color: "#fff",
    padding: theme.spacing(2),
  },
  dialogActions: {
    backgroundColor: "#202c45",
    padding: theme.spacing(1, 3),
  },
  dialogTitle: {
    backgroundColor: "#202c45",
    color: "#fff",
    "& .MuiTypography-root": {
      fontSize: "1.2rem",
      fontWeight: "bold",
    },
  },
  saveButton: {
    backgroundColor: "#2563eb !important",
    borderRadius: "10px",

    color: "#fff",
    "&:hover": {
      backgroundColor: "#2563eb !important",
    },
  },
  closeButton: {
    backgroundColor: "#dc2626 !important",
    borderRadius: "10px",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#dc2626 !important",
    },
  },
  gridContainer: {
    marginTop: theme.spacing(1),
  },
  gridItem: {
    marginBottom: theme.spacing(2),
  },
  testButton: {
    backgroundColor: "#065f46 !important",
    color: "#fff",
    marginRight: "auto",
    marginLeft: 12,
    "&:hover": {
      backgroundColor: "#065f46 !important",
    },
  },
}));

const DialogflowSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  // projectName: Yup.string()
  //   .min(3, "Too Short!")
  //   .max(100, "Too Long!")
  //   .required(),
  // jsonContent: Yup.string().min(3, "Too Short!").required(),
  // language: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required(),
});



const QueueIntegration = ({ open, onClose, integrationId }) => {
  const classes = useStyles();

  const initialState = {
    type: "typebot",
    name: "",
    projectName: "",
    jsonContent: "",
    language: "",
    urlN8N: "",
    typebotDelayMessage: 1000,
    typebotExpires: 1,
    typebotKeywordFinish: "",
    typebotKeywordRestart: "",
    typebotRestartMessage: "",
    typebotSlug: "",
    typebotUnknownMessage: "",

  };

  const [integration, setIntegration] = useState(initialState);

  useEffect(() => {
    (async () => {
      if (!integrationId) return;
      try {
        const { data } = await api.get(`/queueIntegration/${integrationId}`);
        setIntegration((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setIntegration({
        type: "dialogflow",
        name: "",
        projectName: "",
        jsonContent: "",
        language: "",
        urlN8N: "",
        typebotDelayMessage: 1000
      });
    };

  }, [integrationId, open]);

  const handleClose = () => {
    onClose();
    setIntegration(initialState);
  };

  const handleTestSession = async (event, values) => {
    try {
      const { projectName, jsonContent, language } = values;

      await api.post(`/queueIntegration/testSession`, {
        projectName,
        jsonContent,
        language,
      });

      toast.success(i18n.t("queueIntegrationModal.messages.testSuccess"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveDialogflow = async (values) => {
    try {
      if (values.type === 'n8n' || values.type === 'webhook' || values.type === 'typebot') values.projectName = values.name
      if (integrationId) {
        await api.put(`/queueIntegration/${integrationId}`, values);
        toast.success(i18n.t("queueIntegrationModal.messages.editSuccess"));
      } else {
        await api.post("/queueIntegration", values);
        toast.success(i18n.t("queueIntegrationModal.messages.addSuccess"));
      }
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#202c45",
            border: "none",
          },
        }}
      >
        <DialogTitle className={classes.dialogTitle}>
          {integrationId
            ? `${i18n.t("queueIntegrationModal.title.edit")}`
            : `${i18n.t("queueIntegrationModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={integration}
          enableReinitialize={true}
          validationSchema={DialogflowSchema}
          onSubmit={(values, actions, event) => {
            setTimeout(() => {
              handleSaveDialogflow(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>
                <Grid container spacing={2} className={classes.gridContainer}>
                  <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                      margin="dense"
                      fullWidth
                    >
                      <InputLabel id="type-selection-input-label">
                        {i18n.t("queueIntegrationModal.form.type")}
                      </InputLabel>

                      <Field
                        as={Select}
                        label={i18n.t("queueIntegrationModal.form.type")}
                        name="type"
                        labelId="profile-selection-label"
                        error={touched.type && Boolean(errors.type)}
                        helpertext={touched.type && errors.type}
                        id="type"
                        required
                      >
                        <MenuItem value="dialogflow">DialogFlow</MenuItem>
                        <MenuItem value="n8n">N8N</MenuItem>
                        <MenuItem value="webhook">WebHooks</MenuItem>
                        <MenuItem value="typebot">Typebot</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  {values.type === "dialogflow" && (
                    <>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.name")}
                          autoFocus
                          name="name"
                          fullWidth
                          error={touched.name && Boolean(errors.name)}
                          helpertext={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <FormControl
                          variant="outlined"
                          className={classes.formControl}
                          margin="dense"
                          fullWidth
                        >
                          <InputLabel id="language-selection-input-label">
                            {i18n.t("queueIntegrationModal.form.language")}
                          </InputLabel>

                          <Field
                            as={Select}
                            label={i18n.t("queueIntegrationModal.form.language")}
                            name="language"
                            labelId="profile-selection-label"
                            fullWidth
                            error={touched.language && Boolean(errors.language)}
                            helpertext={touched.language && errors.language}
                            id="language-selection"
                            required
                          >
                            <MenuItem value="pt-BR">Portugues</MenuItem>
                            <MenuItem value="en">Inglês</MenuItem>
                            <MenuItem value="es">Español</MenuItem>
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.projectName")}
                          name="projectName"
                          error={touched.projectName && Boolean(errors.projectName)}
                          helpertext={touched.projectName && errors.projectName}
                          fullWidth
                          variant="outlined"
                          margin="dense"
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.jsonContent")}
                          type="jsonContent"
                          multiline
                          maxRows={5}
                          minRows={5}
                          fullWidth
                          name="jsonContent"
                          error={touched.jsonContent && Boolean(errors.jsonContent)}
                          helpertext={touched.jsonContent && errors.jsonContent}
                          variant="outlined"
                          margin="dense"
                          className={classes.textField}
                        />
                      </Grid>
                    </>
                  )}

                  {(values.type === "n8n" || values.type === "webhook") && (
                    <>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.name")}
                          autoFocus
                          required
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helpertext={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={12} xl={12} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.urlN8N")}
                          name="urlN8N"
                          error={touched.urlN8N && Boolean(errors.urlN8N)}
                          helpertext={touched.urlN8N && errors.urlN8N}
                          variant="outlined"
                          margin="dense"
                          required
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                    </>
                  )}
                  {(values.type === "typebot") && (
                    <>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.name")}
                          autoFocus
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helpertext={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          required
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={12} xl={12} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.urlN8N")}
                          name="urlN8N"
                          error={touched.urlN8N && Boolean(errors.urlN8N)}
                          helpertext={touched.urlN8N && errors.urlN8N}
                          variant="outlined"
                          margin="dense"
                          required
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.typebotSlug")}
                          name="typebotSlug"
                          error={touched.typebotSlug && Boolean(errors.typebotSlug)}
                          helpertext={touched.typebotSlug && errors.typebotSlug}
                          required
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.typebotExpires")}
                          name="typebotExpires"
                          error={touched.typebotExpires && Boolean(errors.typebotExpires)}
                          helpertext={touched.typebotExpires && errors.typebotExpires}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.typebotDelayMessage")}
                          name="typebotDelayMessage"
                          error={touched.typebotDelayMessage && Boolean(errors.typebotDelayMessage)}
                          helpertext={touched.typebotDelayMessage && errors.typebotDelayMessage}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.typebotKeywordFinish")}
                          name="typebotKeywordFinish"
                          error={touched.typebotKeywordFinish && Boolean(errors.typebotKeywordFinish)}
                          helpertext={touched.typebotKeywordFinish && errors.typebotKeywordFinish}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.typebotKeywordRestart")}
                          name="typebotKeywordRestart"
                          error={touched.typebotKeywordRestart && Boolean(errors.typebotKeywordRestart)}
                          helpertext={touched.typebotKeywordRestart && errors.typebotKeywordRestart}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} xl={6} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.typebotUnknownMessage")}
                          name="typebotUnknownMessage"
                          error={touched.typebotUnknownMessage && Boolean(errors.typebotUnknownMessage)}
                          helpertext={touched.typebotUnknownMessage && errors.typebotUnknownMessage}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12} md={12} xl={12} className={classes.gridItem}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueIntegrationModal.form.typebotRestartMessage")}
                          name="typebotRestartMessage"
                          error={touched.typebotRestartMessage && Boolean(errors.typebotRestartMessage)}
                          helpertext={touched.typebotRestartMessage && errors.typebotRestartMessage}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>

                    </>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                 {values.type === "dialogflow" && (
                  <Button
                    onClick={(e) => handleTestSession(e, values)}
                    disabled={isSubmitting}
                    name="testSession"
                    variant="contained"
                    className={classes.testButton}
                  >
                    {i18n.t("queueIntegrationModal.buttons.test")}
                  </Button>
                )}
                 <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.closeButton}
                >
                  {i18n.t("queueIntegrationModal.buttons.cancel")}
                </Button> 
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.saveButton}
                >
                  {integrationId
                    ? `${i18n.t("queueIntegrationModal.buttons.okEdit")}`
                    : `${i18n.t("queueIntegrationModal.buttons.okAdd")}`}
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

export default QueueIntegration;