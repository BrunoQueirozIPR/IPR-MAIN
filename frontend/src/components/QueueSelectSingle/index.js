import React, { useEffect, useState } from "react";
import { Field } from "formik";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: 0,
    width: "100%",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#2f3b54",
      borderRadius: "8px",
      color: "#fff",
      height: "40px",
      "& fieldset": {
        border: "none",
      },
      "&:hover": {
        backgroundColor: "rgba(47, 59, 84, 0.9)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#fff",
      transform: "translate(14px, 10px)",
    },
    "& .MuiSelect-icon": {
      color: "#fff",
    },
  },
  menuItem: {
    backgroundColor: "#2f3b54",
    color: "#fff",
    border: "5px solid #14708f",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: "rgba(47, 59, 84, 0.9)",
    },
  },
}));

const QueueSelectSingle = ({ className }) => {
  const classes = useStyles();
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(`QUEUESELETSINGLE >>> ${err}`);
      }
    })();
  }, []);

  return (
    <div style={{ margin: '10px 0' }}>
      <FormControl
        variant="outlined"
        margin="dense"
        fullWidth
        className={classes.formControl}
      >
        <InputLabel>{i18n.t("queueSelect.inputLabel")}</InputLabel>
        <Field
          as={Select}
          label={i18n.t("queueSelect.inputLabel")}
          name="queueId"
          className={classes.formControl}
        >
          {queues.map(queue => (
            <MenuItem 
              key={queue.id} 
              value={queue.id}
              className={classes.menuItem}
            >
              {queue.name}
            </MenuItem>
          ))}
        </Field>
      </FormControl>
    </div>
  );
};

export default QueueSelectSingle;
