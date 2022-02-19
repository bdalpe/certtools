import React from "react";
import {Button, FormControl, InputGroup} from "react-bootstrap";

export class SANList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {list: this.props.initial || []}
        this._state = this.props.state;
    }

    updateState() {
        this._state(this.props.field, this.state.list)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.initial !== this.props.initial) {
            this.setState({...this.state, list: this.props.initial})
        }
    }

    delete(value) {
        let i = this.state.list.indexOf(value);

        if (i > -1) {
            let a = [...this.state.list]
            a.splice(i, 1)
            this.setState({
                list: a
            }, this.updateState)
        }
    }

    update(e, index) {
        let a = [...this.state.list]
        a[index] = e.target.value
        this.setState({
            list: a
        }, this.updateState)
    }

    n(_) {
        let a = [...this.state.list]
        a.push("")
        this.setState({
            list: a
        }, this.updateState)
    }

    render() {
        return (
            <>
                {this.state.list.map((item, index) => {
                    return (
                        <InputGroup key={index} className={"mb-3"}>
                            <FormControl placeholder={this.props.placeholder || ""} size={"md"} value={item}
                                         style={{fontFamily: "monospace"}}
                                         onChange={(e) => {
                                             this.update(e, index)
                                         }}/>
                            <Button variant={"danger"} size={"md"} onClick={() => this.delete(item)}><i
                                className={"bi bi-trash"}/></Button>
                        </InputGroup>
                    )
                })}
                <InputGroup className={"d-grid"}>
                    <Button variant={"success"} onClick={(e) => this.n(e)}>Add Alt {this.props.name}</Button>
                </InputGroup>
            </>
        );
    }
}