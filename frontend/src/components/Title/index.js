import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
	title: {
		fontSize: "18px !important",
		fontWeight: "500 !important",
		color: "#fff !important"
	}
}));

const Title = ({ children }) => {
	const classes = useStyles();

	return (
		<Typography 
			variant="h6" 
			component="h2"
			className={classes.title}
		>
			{children}
		</Typography>
	);
};

export default Title;
