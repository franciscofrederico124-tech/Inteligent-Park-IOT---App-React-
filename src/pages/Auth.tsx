import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import CheckSesssion from '../services/auth/checkSession';
import url from "../hooks/url";

// Importação dos estilos
import '../style/sign.css';
import '../style/variable.css';
import '../style/icons-1.13.1/font/bootstrap-icons.css';

interface AlertState {
    message: string;
    type: 'success' | 'error' | 'info' | '';
    show: boolean;
}

function Sign() {
    useEffect(() => {
        CheckSesssion("sign");
    }, [])

    const navigate = useNavigate();
    const [isSignIn, setIsSignIn] = useState(true);
    const apiBase = url.apiBase;

    // Estados compartilhados/individuais
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estado para os alertas
    const [alert, setAlert] = useState<AlertState>({
        message: '',
        type: '',
        show: false
    });

    // Função para mostrar alerta
    const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
        setAlert({ message, type, show: true });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    // Alternância entre Login e Registro
    function toggleAuthMode() {
        setIsSignIn(!isSignIn);
        // Limpa os campos para evitar confusão de dados
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    };

    function ClearCampos() {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    }



    // Lógica de Login
    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();


        try {
            const response = await fetch(`${apiBase}/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const res = await response.json();

            if (!response.ok || !res.success) {
                showAlert(res.message || 'Erro ao entrar. Verifique suas credenciais.', 'error');
                return;
            }

            showAlert('Login efetuado com sucesso!', 'success');
            if (res.token) localStorage.setItem('token', res.token);
            ClearCampos();
            setTimeout(() => navigate("/"), 1000);

        } catch (err: any) {
            showAlert(`Erro de conexão com o servidor.`, 'error');
            ClearCampos();
        }
    }

    // Lógica de Registro
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showAlert('As senhas não coincidem!', 'error');
            return;
        }

        try {
            const response = await fetch(`${apiBase}/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            if (name.trim().length < 3) {
                return showAlert("Nome inválido! ", "error");
            }

            if (password !== confirmPassword) {
                showAlert('As senhas não coincidem!', 'error');
                return;
            }


            const res = await response.json();

            if (!response.ok || !res.success) {
                showAlert(res.message || 'Erro ao criar conta.', 'error');
                return;
            }

            showAlert('Conta criada! Faça login.', 'success');

            toggleAuthMode();

            setIsSignIn(true); // Volta para o login após registrar
        } catch (err) {
            showAlert('Erro de conexão ao criar conta.', 'error');
            toggleAuthMode();
            console.log(err)
        }
    };

    return (
        <div className="body">
            <main className="auth-main">
                {/* Alerta Dinâmico */}
                <section className={`alert ${alert.show ? 'show' : ''} ${alert.type}`}>
                    {alert.message}
                </section>

                {isSignIn ? (
                    /* FORMULÁRIO DE LOGIN */
                    <form id="signIn" onSubmit={handleSignIn}>
                        <i className="bi bi-person-circle"></i>
                        <h2>Login</h2>

                        <span>
                            <i className="bi bi-envelope"></i>
                            <input
                                type="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </span>

                        <span>
                            <i className="bi bi-lock"></i>
                            <input
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </span>

                        <button type="submit">
                            <i className="bi bi-box-arrow-in-right"></i> Entrar
                        </button>

                        <p className="no-account" onClick={toggleAuthMode} style={{ cursor: 'pointer' }}>
                            Não tem uma conta? <strong>Clique aqui.</strong>
                        </p>
                    </form>
                ) : (
                    /* FORMULÁRIO DE CRIAR CONTA */
                    <form id="signUp" onSubmit={handleSignUp}>
                        <i className="bi bi-person-plus-fill"></i>
                        <h2>Criar Conta</h2>

                        <span>
                            <i className="bi bi-person"></i>
                            <input
                                type="text"
                                placeholder="Digite seu nome completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={3}
                            />
                        </span>

                        <span>
                            <i className="bi bi-envelope"></i>
                            <input
                                type="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </span>

                        <span>
                            <i className="bi bi-lock"></i>
                            <input
                                type="password"
                                placeholder="Crie uma senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </span>

                        <span>
                            <i className="bi bi-lock-fill"></i>
                            <input
                                type="password"
                                placeholder="Confirme sua senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </span>

                        <button type="submit">
                            <i className="bi bi-person-plus"></i> Registrar
                        </button>

                        <p className="no-account" onClick={toggleAuthMode} style={{ cursor: 'pointer' }}>
                            Já tenho uma conta. <strong>Voltar ao login.</strong>
                        </p>
                    </form>
                )}
            </main>
        </div>
    );
}

export default Sign;