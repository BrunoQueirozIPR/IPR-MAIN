import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { socketConnection } from "../../services/socket";

import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CompanyModal from "../../components/CompaniesModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import moment from "moment";
import { Grid } from "@material-ui/core";
import { Search } from "lucide-react";

const reducer = (state, action) => {
    if (action.type === "LOAD_COMPANIES") {
        const companies = action.payload;
        const newCompanies = [];

        companies.forEach((company) => {
            const companyIndex = state.findIndex((u) => u.id === company.id);
            if (companyIndex !== -1) {
                state[companyIndex] = company;
            } else {
                newCompanies.push(company);
            }
        });

        return [...state, ...newCompanies];
    }

    if (action.type === "UPDATE_COMPANIES") {
        const company = action.payload;
        const companyIndex = state.findIndex((u) => u.id === company.id);

        if (companyIndex !== -1) {
            state[companyIndex] = company;
            return [...state];
        } else {
            return [company, ...state];
        }
    }

    if (action.type === "DELETE_COMPANIES") {
        const companyId = action.payload;

        const companyIndex = state.findIndex((u) => u.id === companyId);
        if (companyIndex !== -1) {
            state.splice(companyIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const useStyles = makeStyles((theme) => ({
    mainHeader: {
        marginTop: theme.spacing(2),
    },
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        backgroundColor: theme.mode === "dark" ? "#232d45" : "#fff",
        ...theme.scrollbarStyles,
    },
    tableBody: {
        backgroundColor: theme.mode === "dark" ? "#28334e" : "#fff",
        "& tr": {
            borderRadius: "15px",
            overflow: "hidden",
            backgroundColor: theme.mode === "dark" ? "#28334e" : "#fff",
            height: "60px",
        },
        "& tr td:first-child": {
            borderTopLeftRadius: "15px",
            borderBottomLeftRadius: "15px",
        },
        "& tr td:last-child": {
            borderTopRightRadius: "15px",
            borderBottomRightRadius: "15px",
        },
        "& tr:first-child td": {
            paddingTop: "20px"
        },
        "& tr:last-child td": {
            paddingBottom: "20px"
        },
        "& tr td": {
            backgroundColor: "inherit",
            padding: "16px",
            lineHeight: "28px"
        }
    },
    searchInput: {
        backgroundColor: "#354567",
        borderRadius: 10,
        "& .MuiInputBase-input": {
            color: "#FFFFFF",
        },
        "& .MuiOutlinedInput-notchedOutline": {
            border: "none"
        }
    },
    addButton: {
        backgroundColor: "#536588 !important",
        borderRadius: "10px !important",
    },
}));

const Companies = () => {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [deletingCompany, setDeletingCompany] = useState(null);
    const [companyModalOpen, setCompanyModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [companies, dispatch] = useReducer(reducer, []);
    const { dateToClient, datetimeToClient } = useDate();

    // const { getPlanCompany } = usePlans();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        async function fetchData() {
            if (!user.super) {
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
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchCompanies = async () => {
                try {
                    const { data } = await api.get("/companiesPlan/", {
                        params: { searchParam, pageNumber },
                    });
                    dispatch({ type: "LOAD_COMPANIES", payload: data.companies });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                }
            };
            fetchCompanies();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

    useEffect(() => {
        const companyId = user.companyId;
        const socket = socketConnection({ companyId, userId: user.id });
        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(true);
    };

    const handleCloseCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setCompanyModalOpen(true);
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await api.delete(`/companies/${companyId}`);
            toast.success(i18n.t("compaies.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingCompany(null);
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

    const renderStatus = (row) => {
        return row.status === false ? "Não" : "Sim";
    };

    const renderPlanValue = (row) => {
        return row.planId !== null ? row.plan.amount ? row.plan.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00.00' : "-";
    };

    const renderWhatsapp = (row) => {
        return row.useWhatsapp === false ? "Não" : "Sim";
    };

    const renderFacebook = (row) => {
        return row.useFacebook === false ? "Não" : "Sim";
    };

    const renderInstagram = (row) => {
        return row.useInstagram === false ? "Não" : "Sim";
    };

    const renderCampaigns = (row) => {
        return row.useCampaigns === false ? "Não" : "Sim";
    };

    const renderSchedules = (row) => {
        return row.useSchedules === false ? "Não" : "Sim";
    };

    const renderInternalChat = (row) => {
        return row.useInternalChat === false ? "Não" : "Sim";
    };

    const renderExternalApi = (row) => {
        return row.useExternalApi === false ? "Não" : "Sim";
    };

    

    const rowStyle = (record) => {
        if (moment(record.dueDate).isValid()) {
            const now = moment();
            const dueDate = moment(record.dueDate);
            const diff = dueDate.diff(now, "days");
            if (diff >= 1 && diff <= 5) {
                return { backgroundColor: "#fffead" };
            }
            if (diff <= 0) {
                return { backgroundColor: "#fa8c8c" };
            }
        }
        return {};
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={
                    deletingCompany &&
                    `${i18n.t("compaies.confirmationModal.deleteTitle")} ${deletingCompany.name}?`
                }
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteCompany(deletingCompany.id)}
            >
                {i18n.t("compaies.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <CompanyModal
                open={companyModalOpen}
                onClose={handleCloseCompanyModal}
                aria-labelledby="form-dialog-title"
                companyId={selectedCompany && selectedCompany.id}
            />
            <MainHeader className={classes.mainHeader}>
                <Grid style={{ width: "99.6%", marginTop: "20px" }} container>
                    <Grid xs={12} sm={8} item>
                        <Title>
                            {i18n.t("compaies.title")} ({companies.length})
                        </Title>
                    </Grid>
                    <Grid xs={12} sm={4} item>
                        <Grid spacing={2} container>
                            <Grid xs={6} sm={6} item>
                                <TextField
                                    fullWidth
                                    className={classes.searchInput}
                                    placeholder={i18n.t("contacts.searchPlaceholder")}
                                    type="search"
                                    value={searchParam}
                                    onChange={handleSearch}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment>
                                                <Search 
                                                    size={20}
                                                    color="#FFFFFF"
                                                    strokeWidth={1.5}
                                                    style={{ marginLeft: "10px"}}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid xs={6} sm={6} item>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleOpenCompanyModal}
                                className={classes.addButton}
                            >
                                {i18n.t("compaies.buttons.add")}
                            </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                style={{ borderColor: theme.mode === "dark" ? "#232d45" : "#fff" }}
                onScroll={handleScroll}
            >
                <Table size="small" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{i18n.t("compaies.table.ID")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.status")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.name")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.email")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.namePlan")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.value")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.createdAt")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.dueDate")}</TableCell>
                            <TableCell align="center">{i18n.t("compaies.table.lastLogin")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className={classes.tableBody}>
                        <>
                            {companies.map((company) => (
                                <TableRow 
                                    key={company.id}
                                >
                                    <TableCell align="center">{company.id}</TableCell>
                                    <TableCell align="center">{renderStatus(company.status)}</TableCell>
                                    <TableCell align="center">{company.name}</TableCell>
                                    <TableCell align="center">{company.email}</TableCell>
                                    <TableCell align="center">{company.plan.name}</TableCell>
                                    <TableCell align="center">R$ {renderPlanValue(company)}</TableCell>
                                    <TableCell align="center">{dateToClient(company.createdAt)}</TableCell>
                                    <TableCell align="center">{dateToClient(company.dueDate)}<br /><span>{company.recurrence}</span></TableCell>
                                    <TableCell align="center">{datetimeToClient(company.lastLogin)}</TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={4} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Companies;
