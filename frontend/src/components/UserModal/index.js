import React, { useState, useEffect, useContext, useRef } from "react";

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
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";                     
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import whatsappIcon from '../../assets/images/nopicture.png'
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import useWhatsApps from "../../hooks/useWhatsApps";

import { Can } from "../Can";
import { Avatar, Input } from "@material-ui/core";
import { getBackendUrl } from "../../config";

const backendUrl = getBackendUrl();
const path = require('path');

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		marginBottom: theme.spacing(1),
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
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
	formControl: {
		width: "100%",
		marginLeft: '-1px',
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
		"& .MuiSelect-icon": {
			color: "#fff",
		},
		"& .MuiMenuItem-root": {
			backgroundColor: "#2f3b54",
			color: "#fff",
			"&:hover": {
				backgroundColor: "rgba(47, 59, 84, 0.9)",
			},
		},
		"& .MuiMenu-paper": {
			backgroundColor: "#2f3b54",
		},
	},
	textField: {
		marginRight: theme.spacing(1),
		marginBottom: theme.spacing(1),
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
	avatar: {
		width: theme.spacing(12),
		height: theme.spacing(12),
		margin: theme.spacing(2),
		cursor: 'pointer',
		borderRadius: '50%',
		border: '2px solid #2f3b54',
		backgroundColor: "#2f3b54",
		"&:hover": {
			border: '2px solid #14708f',
		},
	},
	updateDiv: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: theme.spacing(1),
		width: '100%',
	},
	updateInput: {
		display: 'none',
	},
	updateLabel: {
		padding: theme.spacing(1),
		margin: theme.spacing(1),
		textAlign: 'center',
		cursor: 'pointer',
		border: '2px solid #2f3b54',
		borderRadius: '8px',
		minWidth: 160,
		fontWeight: 'bold',
		color: '#fff',
		backgroundColor: "#2f3b54",
		"&:hover": {
			backgroundColor: "rgba(47, 59, 84, 0.9)",
			border: '2px solid #14708f',
		},
	},
	errorUpdate: {
		border: '2px solid #991b1b',
	},
	errorText: {
		color: '#991b1b',
		fontSize: '0.8rem',
		fontWeight: 'bold',
	},
	maxWidth: {
		width: "100%",
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
		"& .MuiSelect-icon": {
			color: "#fff",
		},
		"& .MuiMenuItem-root": {
			backgroundColor: "#2f3b54",
			color: "#fff",
			"&:hover": {
				backgroundColor: "rgba(47, 59, 84, 0.9)",
			},
		},
	},
	dialogContent: {
		backgroundColor: "#202c45",
		color: "#fff",
		padding: theme.spacing(2),
		"& > *:last-child": {
			marginBottom: 0,
		},
	},
	dialogTitle: {
		backgroundColor: "#202c45",
		color: "#fff",
		"& .MuiTypography-root": {
			fontSize: "1.2rem",
			fontWeight: "bold",
		},
	},
	dialogActions: {
		backgroundColor: "#202c45",
		padding: theme.spacing(2),
		justifyContent: "space-between",
	},
	select: {
		"& .MuiMenu-paper": {
			backgroundColor: "#2f3b54",
		},
		"& .MuiMenuItem-root": {
			color: "#fff",
			"&:hover": {
				backgroundColor: "rgba(47, 59, 84, 0.9)",
			},
			"&.Mui-selected": {
				backgroundColor: "#14708f",
				"&:hover": {
					backgroundColor: "rgba(20, 112, 143, 0.9)",
				},
			},
		},
	},
	removeButton: {
		backgroundColor: "#991b1b !important",
		color: "#fff !important",
		borderRadius: "8px",
		textTransform: "none",
		marginTop: theme.spacing(1),
		"&:hover": {
			backgroundColor: "rgba(153, 27, 27, 0.9) !important",
		},
	},
	queueSelect: {
		width: "100%",
		marginLeft: '-1px',
		marginBottom: theme.spacing(1),
		"& .MuiOutlinedInput-root": {
			backgroundColor: "#2f3b54",
			borderRadius: "8px",
			color: "#fff",
			width: "100%",
			"& fieldset": {
				border: "none",
			},
		},
		"& .MuiInputBase-root": {
			backgroundColor: "#2f3b54",
			borderRadius: "8px",
			color: "#fff",
			width: "100%",
		},
		"& .MuiSelect-select": {
			backgroundColor: "#2f3b54",
		},
		"& .MuiInputLabel-root": {
			color: "#fff",
		},
		"& .MuiSelect-icon": {
			color: "#fff",
		},
		"& .MuiAutocomplete-root": {
			width: "100%",
		},
		"& .MuiAutocomplete-input": {
			color: "#fff",
		},
		"& .MuiAutocomplete-endAdornment": {
			color: "#fff",
		},
		"& .MuiAutocomplete-clearIndicator": {
			color: "#fff",
		},
		"& .MuiAutocomplete-popupIndicator": {
			color: "#fff",
		},
		"& .MuiAutocomplete-paper": {
			backgroundColor: "#2f3b54",
			color: "#fff",
		},
		"& .MuiAutocomplete-option": {
			color: "#fff",
			"&:hover": {
				backgroundColor: "rgba(47, 59, 84, 0.9)",
			},
			"&[aria-selected='true']": {
				backgroundColor: "#14708f",
			},
		},
		"& .MuiChip-root": {
			backgroundColor: "#14708f",
			color: "#fff",
			"& .MuiChip-deleteIcon": {
				color: "#fff",
				"&:hover": {
					color: "#991b1b",
				},
			},
		},
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Muito curto!")
		.max(50, "Muito longo!")
		.required("Obrigatório"),
	password: Yup.string().min(5, "Muito curto!").max(50, "Muito longo!"),
	email: Yup.string().email("Email inválido").required("Obrigatório"),
});

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		startWork: "00:00",
		endWork: "23:59",
		farewellMessage: "",
		allTicket: "disable",
		allowGroup: false,
		defaultTheme: "light",
		defaultMenu: "open",
		wpp: "",
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [selectedQueueIdsRead, setSelectedQueueIdsRead] = useState([]);
	const [whatsappId, setWhatsappId] = useState(false);
	const { loading, whatsApps } = useWhatsApps();
	const [profileUrl, setProfileUrl] = useState(null)

	const startWorkRef = useRef();
	const endWorkRef = useRef();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});

				const { profileImage } = data;
				setProfileUrl(`${backendUrl}/public/company${data.companyId}/user/${profileImage}`);

				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : '');
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async values => {
		const uploadAvatar = async (file) => {
			const formData = new FormData();
			formData.append('userId', file.id);
			formData.append('typeArch', "user");
			formData.append('profileImage', file.profileImage);

			const { data } = await api.post(`/users/${file.id}/media-upload`, formData);

			localStorage.setItem("profileImage", data.user.profileImage);

		}
		const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
		try {
			if (userId) {
				const { data } = await api.put(`/users/${userId}`, userData);
				console.log(user, profileUrl, data)
				window.localStorage.setItem("preferredTheme", values.defaultTheme);

				if (user.profileImage && user.profileImage !== path.basename(profileUrl))
					uploadAvatar(user)
			} else {
				const { data } = await api.post("/users", userData);
				window.localStorage.setItem("preferredTheme", values.defaultTheme);

				if (user.profileImage && user.avatar)
					uploadAvatar(user)
			}

			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	const handleUpdateProfileImage = (e) => {
		if (!e.target.files[0]) return;

		const newAvatarUrl = URL.createObjectURL(e.target.files[0]);
		setUser(prevState => ({
			...prevState,
			avatar: newAvatarUrl,
			profileImage: e.target.files[0]
		}));
		setProfileUrl(newAvatarUrl);
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
					{userId
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers className={classes.dialogContent}>
								<FormControl className={classes.updateDiv}>
									<label htmlFor="profileImage">
										<Avatar
											src={profileUrl ? profileUrl : whatsappIcon}
											alt="profile-image"
											className={`${classes.avatar} ${touched.profileImage && errors.profileImage ? classes.errorUpdate : ''}`}
										/>
									</label>
									<FormControl className={classes.updateDiv}>
										<label htmlFor="profileImage"
											className={`${classes.updateLabel} ${touched.profileImage && errors.profileImage ? classes.errorUpdate : ''}`}
										>
											{profileUrl ? i18n.t("userModal.title.updateImage") : i18n.t("userModal.buttons.addImage")}
										</label>
										{
											touched.profileImage && errors.profileImage && (
												<span className={classes.errorText}>{errors.profileImage}</span>)
										}
										<Input
											type="file"
											name="profileImage"
											id="profileImage"
											className={classes.updateInput}
											onChange={event => handleUpdateProfileImage(event)}
										/>
									</FormControl>
									{user.avatar &&
										<Button
											variant="outlined"
											color="secondary"
											onClick={() => {
												setUser(prevState => ({ ...prevState, avatar: null, profileImage: null }));
												setProfileUrl(whatsappIcon);
											}}
										>
											{i18n.t("userModal.title.removeImage")}
										</Button>
									}
								</FormControl>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
										className={classes.textField}
									/>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.password")}
										type="password"
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										variant="outlined"
										margin="dense"
										fullWidth
										className={classes.textField}
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
										className={classes.textField}
									/>
								</div>
								<div className={classes.multFieldLine}>
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
										fullWidth
									>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<>
													<InputLabel>
														{i18n.t("userModal.form.profile")}
													</InputLabel>
													<Field
														as={Select}
														name="profile"
														label={i18n.t("userModal.form.profile")}
													>
														<MenuItem value="">&nbsp;</MenuItem>
														<MenuItem value="admin">Admin</MenuItem>
														<MenuItem value="user">User</MenuItem>
													</Field>
												</>
											)}
										/>
									</FormControl>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("contactModal.form.number")}
										name="wpp"
										placeholder="5513912344321"
										error={touched.wpp && Boolean(errors.wpp)}
										helperText={touched.wpp && errors.wpp}
										variant="outlined"
										margin="dense"
										fullWidth
										className={classes.textField}
									/>

								</div>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<div className={classes.multFieldLine}>
											<FormControl className={classes.queueSelect} fullWidth>
												<QueueSelect
													selectedQueueIds={selectedQueueIds}
													onChange={values => setSelectedQueueIds(values)}
													fullWidth
												/>
											</FormControl>
										</div>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<div className={classes.multFieldLine}>
											<FormControl className={classes.queueSelect} fullWidth>
												<QueueSelect
													selectedQueueIds={selectedQueueIdsRead}
													onChange={values => setSelectedQueueIdsRead(values)}
													fullWidth
													label={"RO"}
												/>
											</FormControl>
										</div>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
											<InputLabel>
												{i18n.t("userModal.form.whatsapp")}
											</InputLabel>
											<Field
												as={Select}
												value={whatsappId}
												onChange={(e) => setWhatsappId(e.target.value)}
												label={i18n.t("userModal.form.whatsapp")}

											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												{whatsApps.map((whatsapp) => (
													<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
												))}
											</Field>
										</FormControl>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<div className={classes.multFieldLine}>
											<Field
												as={TextField}
												label={i18n.t("userModal.form.startWork")}
												type="time"
												ampm={"false"}
												inputRef={startWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="startWork"
												error={
													touched.startWork && Boolean(errors.startWork)
												}
												helperText={
													touched.startWork && errors.startWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>
											<Field
												as={TextField}
												label={i18n.t("userModal.form.endWork")}
												type="time"
												ampm={"false"}
												inputRef={endWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="endWork"
												error={
													touched.endWork && Boolean(errors.endWork)
												}
												helperText={
													touched.endWork && errors.endWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>
										</div>
									)}
								/>

								<Field
									as={TextField}
									label={i18n.t("userModal.form.farewellMessage")}
									type="farewellMessage"
									multiline
									rows={4}
									fullWidth
									name="farewellMessage"
									error={touched.farewellMessage && Boolean(errors.farewellMessage)}
									helperText={touched.farewellMessage && errors.farewellMessage}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								<div className={classes.multFieldLine}>
									<Can
										role={loggedInUser.profile}
										perform="user-modal:editProfile"
										yes={() =>
											<FormControl
												variant="outlined"
												className={classes.maxWidth}
												margin="dense"
												fullWidth
											>
												<>
													<InputLabel >
														{i18n.t("userModal.form.allTicket")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("userModal.form.allTicket")}
														name="allTicket"
														type="allTicket"
														required
													>
														<MenuItem value="enable">{i18n.t("userModal.form.allTicketEnable")}</MenuItem>
														<MenuItem value="disable">{i18n.t("userModal.form.allTicketDisable")}</MenuItem>
													</Field>
												</>
											</FormControl>
										}
									/>
									<Can
										role={loggedInUser.profile}
										perform="user-modal:editProfile"
										yes={() =>
											<FormControl
												variant="outlined"
												className={classes.maxWidth}
												margin="dense"
												fullWidth
											>
												<>
													<InputLabel >
														{i18n.t("userModal.form.allowGroup")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("userModal.form.allowGroup")}
														name="allowGroup"
														type="allowGroup"
														required
													>
														<MenuItem value={true}>{i18n.t("userModal.form.allTicketEnable")}</MenuItem>
														<MenuItem value={false}>{i18n.t("userModal.form.allTicketDisable")}</MenuItem>
													</Field>
												</>
											</FormControl>
										}
									/>
								</div>
								<div className={classes.multFieldLine}>
									<FormControl
										variant="outlined"
										className={classes.maxWidth}
										margin="dense"
										fullWidth
									>
										<>
											<InputLabel >
												{i18n.t("userModal.form.defaultTheme")}
											</InputLabel>

											<Field
												as={Select}
												label={i18n.t("userModal.form.defaultTheme")}
												name="defaultTheme"
												type="defaultTheme"
												required
											>
												<MenuItem value="light">{i18n.t("userModal.form.defaultThemeLight")}</MenuItem>
												<MenuItem value="dark">{i18n.t("userModal.form.defaultThemeDark")}</MenuItem>
											</Field>
										</>
									</FormControl>

									<FormControl
										variant="outlined"
										className={classes.maxWidth}
										margin="dense"
										fullWidth
									>
										<>
											<InputLabel >
												{i18n.t("userModal.form.defaultMenu")}
											</InputLabel>

											<Field
												as={Select}
												label={i18n.t("userModal.form.defaultMenu")}
												name="defaultMenu"
												type="defaultMenu"
												required
											>
												<MenuItem value={"open"}>{i18n.t("userModal.form.defaultMenuOpen")}</MenuItem>
												<MenuItem value={"closed"}>{i18n.t("userModal.form.defaultMenuClosed")}</MenuItem>
											</Field>
										</>
									</FormControl>
								</div>
							</DialogContent>
							<DialogActions className={classes.dialogActions}>
								<Button
									onClick={handleClose}
									variant="outlined"
									disabled={isSubmitting}
									className={classes.closeButton}
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={isSubmitting}
									className={classes.saveButton}
								>
									{userId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
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

export default UserModal;
