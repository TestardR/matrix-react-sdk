/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {MatrixClientPeg} from '../../../MatrixClientPeg';
import * as sdk from '../../../index';
import { _t } from '../../../languageHandler';
import {getNameForEventRoom, userLabelForEventRoom}
    from '../../../utils/KeyVerificationStateObserver';
import dis from "../../../dispatcher";
import {RIGHT_PANEL_PHASES} from "../../../stores/RightPanelStorePhases";

export default class MKeyVerificationRequest extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const request = this.props.mxEvent.verificationRequest;
        if (request) {
            request.on("change", this._onRequestChanged);
        }
    }

    componentWillUnmount() {
        const request = this.props.mxEvent.verificationRequest;
        if (request) {
            request.off("change", this._onRequestChanged);
        }
    }

    _openRequest = () => {
        const {verificationRequest} = this.props.mxEvent;
        const member = MatrixClientPeg.get().getUser(verificationRequest.otherUserId);
        dis.dispatch({
            action: "set_right_panel_phase",
            phase: RIGHT_PANEL_PHASES.EncryptionPanel,
            refireParams: {verificationRequest, member},
        });
    };

    _onRequestChanged = () => {
        this.forceUpdate();
    };

    _onAcceptClicked = async () => {
        const request = this.props.mxEvent.verificationRequest;
        if (request) {
            try {
                await request.accept();
                this._openRequest();
            } catch (err) {
                console.error(err.message);
            }
        }
    };

    _onRejectClicked = async () => {
        const request = this.props.mxEvent.verificationRequest;
        if (request) {
            try {
                await request.cancel();
            } catch (err) {
                console.error(err.message);
            }
        }
    };

    _acceptedLabel(userId) {
        const client = MatrixClientPeg.get();
        const myUserId = client.getUserId();
        if (userId === myUserId) {
            return _t("You accepted");
        } else {
            return _t("%(name)s accepted", {name: getNameForEventRoom(userId, this.props.mxEvent.getRoomId())});
        }
    }

    _cancelledLabel(userId) {
        const client = MatrixClientPeg.get();
        const myUserId = client.getUserId();
        if (userId === myUserId) {
            return _t("You cancelled");
        } else {
            return _t("%(name)s cancelled", {name: getNameForEventRoom(userId, this.props.mxEvent.getRoomId())});
        }
    }

    render() {
        const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
        const FormButton = sdk.getComponent("elements.FormButton");

        const {mxEvent} = this.props;
        const request = mxEvent.verificationRequest;

        if (!request || request.invalid) {
            return null;
        }

        let title;
        let subtitle;
        let stateNode;

        const accepted = request.ready || request.started || request.done;
        if (accepted || request.cancelled) {
            let stateLabel;
            if (accepted) {
                stateLabel = (<AccessibleButton onClick={this._openRequest}>
                    {this._acceptedLabel(request.receivingUserId)}
                </AccessibleButton>);
            } else {
                stateLabel = this._cancelledLabel(request.cancellingUserId);
            }
            stateNode = (<div className="mx_cryptoEvent_state">{stateLabel}</div>);
        }

        if (!request.initiatedByMe) {
            const name = getNameForEventRoom(request.requestingUserId, mxEvent.getRoomId());
            title = (<div className="mx_cryptoEvent_title">{
                _t("%(name)s wants to verify", {name})}</div>);
            subtitle = (<div className="mx_cryptoEvent_subtitle">{
                userLabelForEventRoom(request.requestingUserId, mxEvent.getRoomId())}</div>);
            if (request.requested && !request.observeOnly) {
                stateNode = (<div className="mx_cryptoEvent_buttons">
                    <FormButton kind="danger" onClick={this._onRejectClicked} label={_t("Decline")} />
                    <FormButton onClick={this._onAcceptClicked} label={_t("Accept")} />
                </div>);
            }
        } else { // request sent by us
            title = (<div className="mx_cryptoEvent_title">{
                _t("You sent a verification request")}</div>);
            subtitle = (<div className="mx_cryptoEvent_subtitle">{
                userLabelForEventRoom(request.receivingUserId, mxEvent.getRoomId())}</div>);
        }

        if (title) {
            return (<div className="mx_EventTile_bubble mx_cryptoEvent mx_cryptoEvent_icon">
                {title}
                {subtitle}
                {stateNode}
            </div>);
        }
        return null;
    }
}

MKeyVerificationRequest.propTypes = {
    /* the MatrixEvent to show */
    mxEvent: PropTypes.object.isRequired,
};
