/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

export default class DeviceVerifyOwnDialog extends React.Component {
    static propTypes = {
        verificationRequest: PropTypes.object.isRequired,
        onFinished: PropTypes.func.isRequired,
    };

    render() {
        const EncryptionPanel = sdk.getComponent("views.right_panel.EncryptionPanel");
        return <EncryptionPanel
            layout="dialog"
            verificationRequest={this.props.verificationRequest}
            onClose={this.props.onFinished}
            member={MatrixClientPeg.get().getUser(this.props.verificationRequest.otherUserId)}
        />;
    }
}
