import React from "react";
import {Accordion, Button, Card, Col, Container, InputGroup, Modal, Row} from "react-bootstrap";
import {SubjectText} from "./SubjectText";
import Form from "react-bootstrap/Form";
import {SANList} from "./SANLIst";
import forge from "node-forge";

export class CSR extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cn: "",
            o: "",
            ou: "",
            l: "",
            st: "",
            c: "",
            keySize: 2048,
            sig: 'sha256WithRSAEncryption',
            altDNSNames: [],
            altIPAddr: [],
            keys: {
                private: "",
                public: ""
            },
            showModal: false,
            generating: false
        }

        this._state = this.updateState.bind(this);
    }

    updateState(field, value) {
        this.setState({...this.state, [field]: value})
    }

    handleClose = () => this.setState({...this.state, showModal: false, csr: undefined, keys: {private: undefined, public: undefined}})

    decodeCSR(e, state) {
        try {
            const pki = forge.pki;

            let csr = pki.certificationRequestFromPem(e.target.value);

            this.setState({
                ...state,
                ...['CN', 'OU', 'O', 'L', 'ST', 'C'].map(e =>
                    ({[e.toLowerCase()]: csr.subject.getField(e)?.value}))
                    .reduce((obj, item) => ({...obj, ...item}), {}),
                keySize: csr.publicKey.n.bitLength(),
                sig: pki.oids[csr.siginfo.algorithmOid],
                altDNSNames: csr.attributes.find(t => t.name === 'extensionRequest')?.extensions
                    .find(t=>t.name === 'subjectAltName')?.altNames?.filter(element =>
                        element.type === 2 && element.value !== csr.subject.getField('CN')?.value)
                    .map(e => e.value),
                altIPAddr: csr.attributes.find(t => t.name === 'extensionRequest')?.extensions
                    .find(t=>t.name === 'subjectAltName')?.altNames?.filter(element =>
                        element.type === 7)
                    .map(e => e.ip)
            });
        } catch (e) {
            console.error(e);
        }
    }

    onFormSubmit(e, state) {
        // Generate the CSR
        try {
            const pki = forge.pki;

            // const pk = state.pk ? pki.privateKeyFromPem(state.pk) : pki.rsa.generateKeyPair(state.keySize);
            const pk = pki.rsa.generateKeyPair(state.keySize);

            let csr = pki.createCertificationRequest()
            csr.publicKey = pk.publicKey;

            const shortNames = ['CN', 'OU', 'O', 'L', 'ST', 'C']
            const values = [state.cn, state.ou, state.o, state.l, state.st, state.c]

            csr.setSubject(shortNames.map((element, index) => ({shortName: element, value: values[index]})))

            csr.setAttributes([{
                name: 'extensionRequest',
                extensions: [{
                    name: 'subjectAltName',
                    altNames: Array.prototype.concat(
                        {
                            type: 2,
                            value: state.cn
                        },
                        state.altDNSNames.map(element => ({
                            type: 2,
                            value: element
                        })),
                        state.altIPAddr.map(element => ({
                            type: 7,
                            ip: element
                        }))
                    )
                }]
            }])

            let md;
            switch (state.sig) {
                case 'sha1WithRSAEncryption':
                    md = forge.md.sha1.create();
                    break;
                case 'md5WithRSAEncryption':
                    md = forge.md.md5.create();
                    break;
                case 'sha256WithRSAEncryption':
                    md = forge.md.sha256.create();
                    break;
                case 'sha512WithRSAEncryption':
                    md = forge.md.sha512.create();
                    break;
                default:
                    md = forge.md.sha1.create();
            }

            csr.sign(pk.privateKey, md);

            this.setState({
                ...this.state,
                keys: {
                    public: pki.publicKeyToPem(pk.publicKey).trimEnd(),
                    private: pki.privateKeyToPem(pk.privateKey).trimEnd()
                },
                csr: pki.certificationRequestToPem(csr).trimEnd(),
                showModal: true
            })
        } catch (e) {
            console.error(e);
        }

        e.preventDefault();
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col/>
                    <Col lg={8}>
                        <div className={"text-center mt-3"}>
                            <h3>Generate a Certificate Signing Request</h3>
                        </div>
                        <form onSubmit={e => {
                            this.onFormSubmit(e, this.state)
                        }} className={"mt-3"} autoComplete={"none"}>
                            <Row>
                                <Col lg={6}>
                                    <SubjectText label={"Common Name"}
                                                 tooltip={"The FQDN for your domain"}
                                                 placeholder={"servername.example.com"}
                                                 state={this._state}
                                                 value={this.state.cn}
                                                 field={"cn"}
                                                 large={true}
                                                 required={true}
                                    />
                                    <SubjectText label={"Organizational Unit"}
                                                 tooltip={"Branch of organization"}
                                                 placeholder={"Information Security Team"}
                                                 state={this._state}
                                                 field={"ou"}
                                                 value={this.state.ou}
                                    />
                                    <SubjectText label={"Organization"}
                                                 placeholder={"Your Company"}
                                                 state={this._state}
                                                 field={"o"}
                                                 value={this.state.o}
                                    />
                                    <SubjectText label={"Locality"}
                                                 placeholder={"City"}
                                                 state={this._state}
                                                 field={"l"}
                                                 value={this.state.l}
                                    />
                                    <SubjectText label={"State"}
                                                 placeholder={"State"}
                                                 state={this._state}
                                                 field={"st"}
                                                 value={this.state.st}
                                    />
                                    <SubjectText label={"Country"}
                                                 placeholder={"Country Code"}
                                                 default={this.state.c}
                                                 state={this._state}
                                                 field={"c"}
                                                 value={this.state.c}
                                    />

                                    <Form.Group className={"mb-2"}>
                                        <Form.Label>Key Size</Form.Label>
                                        <Form.Select value={this.state.keySize} onChange={e => this.setState({
                                            ...this.state,
                                            keySize: +e.target.value
                                        })}>
                                            <option>2048</option>
                                            <option>4096</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Signature Algorithm</Form.Label>
                                        <Form.Select value={this.state.sig} onChange={e => this.setState({
                                            ...this.state,
                                            sig: e.target.value
                                        })}>
                                            <option value={"sha1WithRSAEncryption"}>SHA-1</option>
                                            <option value={"sha256WithRSAEncryption"}>SHA-256</option>
                                            <option value={"sha384WithRSAEncryption"}>SHA-384</option>
                                            <option value={"sha512WithRSAEncryption"}>SHA-512</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Card className={"mb-3"}>
                                        <Card.Header>Alternate DNS Names</Card.Header>
                                        <Card.Body>
                                            <SANList name={"DNS Name"}
                                                     placeholder={"subdomain.example.com"}
                                                     state={this._state}
                                                     field={"altDNSNames"}
                                                     initial={this.state.altDNSNames}
                                            />
                                        </Card.Body>
                                    </Card>
                                    <Card className={"mb-3"}>
                                        <Card.Header>Alternate IP Addresses</Card.Header>
                                        <Card.Body>
                                            <SANList name={"IP Address"}
                                                     placeholder={"1.2.3.4"}
                                                     state={this._state}
                                                     field={"altIPAddr"}
                                                     initial={this.state.altIPAddr}
                                            />
                                        </Card.Body>
                                    </Card>
                                    <Row>
                                        <InputGroup className={"d-grid"}>
                                            <Button type={"submit"} size={"lg"} variant={"primary"}>
                                                Generate CSR
                                            </Button>
                                        </InputGroup>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className={"mt-4"}>
                                <Accordion>
                                    <Accordion.Item eventKey={"0"}>
                                        <Accordion.Header>Advanced Options</Accordion.Header>
                                        <Accordion.Body>
                                            <Row>
                                                <Col md={"6"}>
                                                    <Form.Control as={"textarea"} rows={20}
                                                                  style={{fontFamily: "monospace"}}
                                                                  placeholder={"Private key..."}
                                                                  onChange={e => this.setState({
                                                                      ...this.state,
                                                                      keys: {private: e.target.value}}
                                                                  )}
                                                    />
                                                </Col>
                                                <Col md={"6"}>
                                                    <Form.Control as={"textarea"} rows={20}
                                                                  style={{fontFamily: "monospace"}}
                                                                  placeholder={"Certificate Signing Request (CSR)..."}
                                                                  id={"csr"}
                                                                  onChange={e => this.decodeCSR(e, this.state)}
                                                    />
                                                </Col>
                                            </Row>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </Row>
                        </form>
                    </Col>
                    <Col/>
                </Row>
                <Modal show={this.state.showModal} onHide={this.handleClose} size={"lg"}>
                    <Modal.Header>
                        <Modal.Title>Certificate Signing Request</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.csr?.split('\n').map((item, key) => {
                          return <span style={{fontFamily: "monospace"}} key={key}>{item}<br/></span>
                        })}

                        <br/>

                        {this.state.keys.private?.split('\n').map((item, key) => {
                          return <span style={{fontFamily: "monospace"}} key={key}>{item}<br/></span>
                        })}
                        </Modal.Body>
                </Modal>
            </Container>
        );
    }
}