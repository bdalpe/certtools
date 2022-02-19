import React from 'react'
import Form from "react-bootstrap/Form";
import {Button, Col, Container, InputGroup, Row} from "react-bootstrap";
import forge from "node-forge";

export class PKDecrypt extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pk: undefined,
            pass: undefined,
            decrypted: undefined,
            visible: false
        }
    }

    decrypt(e, state) {
        try {
            const pki = forge.pki;
            let privKey = pki.decryptRsaPrivateKey(state.pk, state.pass);
            let decrypted = pki.privateKeyToPem(privKey).trimEnd();
            this.setState({...state, decrypted})
        } catch (e) {
            this.setState({...state, decrypted: "Failed to decrypt. Check passphrase and private key!"})
        }

        e.preventDefault()
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col/>
                    <Col lg={8}>
                        <div className={"text-center mt-3"}>
                            <h3>Private Key Decrypter</h3>
                        </div>
                        <Form onSubmit={e => this.decrypt(e, this.state)}>
                            <Row>
                                <Form.Control as={"textarea"}
                                              rows={20}
                                              style={{fontFamily: "monospace"}}
                                              placeholder={"Private key..."}
                                              onChange={e => this.setState({...this.state, pk: e.target.value})}
                                />
                            </Row>
                            <Row className={"mt-3"}>
                                <InputGroup className={"px-0"}>
                                    <Form.Control type={this.state.visible ? "text" : "password"}
                                                  style={{fontFamily: "monospace"}}
                                                  placeholder={"Passphrase..."}
                                                  onChange={e => this.setState({...this.state, pass: e.target.value})}
                                    />
                                    <Button variant={"primary"} size={"md"} onClick={() => {
                                        this.setState({...this.state, visible: !this.state.visible})
                                    }}>
                                        <i className={`bi bi-eye${this.state.visible ? "" : "-slash"}`}/>
                                    </Button>
                                </InputGroup>
                            </Row>
                            <Row className={"mt-3"}>
                                <Button type={"submit"} size={"lg"} variant={"primary"}>Decrypt</Button>
                            </Row>
                            <Row className={"mt-3"}>
                                <Form.Control as={"textarea"}
                                              rows={20}
                                              style={{fontFamily: "monospace"}}
                                              placeholder={"Private key..."}
                                              disabled={true}
                                              hidden={!this.state.decrypted}
                                              value={this.state.decrypted}
                                />
                            </Row>
                        </Form>
                    </Col>
                    <Col/>
                </Row>
            </Container>
        );
    }
}