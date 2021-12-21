// Note: the business rule must be run even if the IP address has not been touched
// This is to cater for the scenarion where the IP address is disconnected from
// the NIC or re-assigned to a different NIC; in this case the CI MUST be updated
// to reflect it

(function executeRule(current, previous /*null when async*/) {

    function _connectIP(grIpAddress, grCi) {

        if (grIpAddress.isValidRecord() && grCi.isValidRecord()) {
            grCi.setValue('ip_address', grIpAddress.getValue('ip_address'));
            grCi.setWorkflow(false);
            grCi.update();
        }

    }

    function _disconnectIP(grIpAddress, grCi) {

        var updateCi = true;
        var grOtherIp;

        if (grIpAddress.isValidRecord() && grCi.isValidRecord()) {

            grOtherIp = new GlideRecord('cmdb_ci_ip_address');
            grOtherIp.addQuery('sys_id', '!=', grIpAddress.getUniqueValue());
            grOtherIp.addQuery('nic.cmdb_ci', grCi.getUniqueValue());
            grOtherIp.addNotNullQuery('ip_address', grCi.getValue('cmdb_ci'));
            grOtherIp.query();

            // If we have no IP addresses left, then clear the CI IP address field
            // If we have IP addresses left but the current CI IP address is not
            // the one we deleted, then leave it untouched (no need to update)
            // If we deleted the IP address that is currently the one in the CI,
            // then fetch a new IP address from the existing ones

            if (grOtherIp.next()) {

                if (grCi.getValue('ip_address') === grIpAddress.getValue('ip_address')) {
                    grCi.setValue('ip_address', grOtherIp.getValue('ip_address'));
                } else {
                    updateCi = false;
                }

            } else {

                grCi.setValue('ip_address', '');

            }

            if (updateCi) {
                grCi.setWorkflow(false);
                grCi.update();
            }

        }

    }

    var grNewNicCi;
    var grOldNicCi;

    // Get a GlideRecord on both the current and the previous IP Address NIC CI

    grNewNicCi = current.nic.cmdb_ci.getRefRecord();
    if (current.nic.changes()) {
        grOldNicCi = previous.nic.cmdb_ci.getRefRecord();
    } else {
        grOldNicCi = grNewNicCi;
    }


    // Process each operation on the IP address

    switch (String(current.operation())) {

        case 'insert':
        _connectIP(current, grNewNicCi);
        break;

        case 'update':
        if (current.nic.changes()) {
            _disconnectIP(previous, grOldNicCi);
        }
        _connectIP(current, grNewNicCi);
        break;

        case 'delete':
        _disconnectIP(current, grNewNicCi);
        break;

    }

})(current, previous);
