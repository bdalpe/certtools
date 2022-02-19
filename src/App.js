import React from 'react';
import './App.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {CSR} from './components/CSR'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Container, Nav, Navbar} from "react-bootstrap";
import {PKDecrypt} from "./components/PKDecrypt";

function app() {
    return (
        <Container>
            <Router>
                <Navbar>
                    <Container>
                        <Navbar.Brand>Certificate Tools</Navbar.Brand>
                        <Navbar.Collapse>
                            <Nav>
                                <Nav.Link href={"/"}>CSR Generator</Nav.Link>
                                <Nav.Link href={"/decrypt"}>Private Key Decrypter</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Routes>
                    <Route path={"/"} element={<CSR />} />
                    <Route path={"/decrypt"} element={<PKDecrypt />} />
                </Routes>
            </Router>
        </Container>
    );
}

export default app;
