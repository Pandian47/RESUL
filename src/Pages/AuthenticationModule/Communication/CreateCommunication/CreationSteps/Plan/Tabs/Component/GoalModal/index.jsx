import { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { RSPrimaryButton } from 'Components/Buttons';
import { GOAL_INFO_DESCRIPTION, GOAL_INFO_TITLE, OK } from '../../../constants';
class GoalModal extends Component {
    state = {
        isShow: this.props.isOpen,
    };
    render() {
        return (
            <Modal
                backdrop="static"
                keyboard={false}
                onHide={() => {
                    this.setState({ isShow: !this.state.isShow });
                    this.props.onChangeIsOpen(false);
                }}
                show={this.state.isShow}
                centered
                size="md"
            >
                <Modal.Header closeButton>
                    <h2>{GOAL_INFO_TITLE}</h2>
                </Modal.Header>
                <Modal.Body>
                    <p className="marginB0">{GOAL_INFO_DESCRIPTION}</p>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-end marginT20">
                        <RSPrimaryButton
                            onClick={() => {
                                this.setState({ isShow: !this.state.isShow });
                                this.props.onChangeIsOpen(true);
                            }}
                        >
                            {OK}
                        </RSPrimaryButton>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default GoalModal;
