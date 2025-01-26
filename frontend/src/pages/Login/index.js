import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";

import {
    TextField,
    InputAdornment,
    IconButton,
    Grid
} from '@material-ui/core';

import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons';

import '../../assets/css/style.css';

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";

import wave from '../../assets/images/wave.png'
import bg from '../../assets/movie.mp4'

// import avatar from '../../assets/images/avatar.svg'
import logo from '../../assets/images/logo.png';

const Login = () => {
    const [user, setUser] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const { handleLogin } = useContext(AuthContext);

    const handleChangeInput = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handlSubmit = (e) => {
        e.preventDefault();
        handleLogin(user);
    };

    return (
        <>
            {/* <img className="wave" src={wave} /> */}
            <div style={{ display: 'flex', height: '100vh' }}>
                <div style={{ flex: '0 0 70%', position: 'relative' }}>
                    <video autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                        <source src={bg} type="video/mp4" />
                    </video>
                </div>
                <div className="login-content" style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={logo} alt={logo} style={{ width: '200%', height: "50%", maxWidth: '300px', marginBottom: 20 }} />
                        <form noValidate onSubmit={handlSubmit} style={{ display: "grid", maxWidth: '80%' }}>
                            <TextField
                                variant="standard"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label={i18n.t("login.form.email")}
                                name="email"
                                value={user.email}
                                onChange={handleChangeInput}
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                variant="standard"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label={i18n.t("login.form.password")}
                                id="password"
                                value={user.password}
                                onChange={handleChangeInput}
                                autoComplete="current-password"
                                type={showPassword ? 'text' : 'password'}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword((e) => !e)}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Grid container justify="flex-end">
                                <Grid item>
                                    <Link
                                        href="#"
                                        variant="body2"
                                        component={RouterLink}
                                        to="/recovery-password"
                                    >
                                        {i18n.t("Recuperar Senha?")}
                                    </Link>
                                </Grid>
                            </Grid>

                            <input type="submit" className="btn" value="Acessar" />
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
