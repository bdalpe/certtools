import React from "react";
import Form from "react-bootstrap/Form";

export class SubjectText extends React.Component {
    constructor(props) {
        super(props);
        this._state = this.props.state;
    }

    update(e, field) {
        this._state(field, e.target.value);
    }

    render() {
        return (
            <Form.Group className={"mb-2"}>
                <Form.Label data-tooltip={this.props.tooltip}>{this.props.label}</Form.Label>
                <Form.Control type="text"
                              size={this.props.large ? "lg" : ""}
                              placeholder={this.props.placeholder}
                              value={this.props.value || ""}
                              required={this.props.required || false}
                              onChange={(e) => this.update(e, this.props.field)}
                />
            </Form.Group>
        )
    }
}