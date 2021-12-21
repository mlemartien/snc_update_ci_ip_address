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

    // Promote hoisting

    var newNicCi;
    var oldNicCi;

    // Get a GlideRecord on both the current and the previous NIC

    newNicCi = current.nic.cmdb_ci.getRefRecord();
    if (current.nic.changes()) {
        oldNicCi = previous.nic.cmdb_ci.getRefRecord();
    } else {
        oldNicCi = newNicCi;
    }


    // Process each operation on the IP address

    switch (String(current.operation())) {

        // For a new IP address, simply update the CI with the new IP address

        case 'insert':
        _connectIP(current, newNicCi);
        break;

        // For an updated IP address...

        case 'update':
        if (current.nic.changes()) {
            _disconnectIP(previous, oldNicCi);
        }
        _connectIP(current, newNicCi);

        break;

        // When removing an IP address, verify if it was the last one against this CI

        case 'delete':
        _disconnectIP(current, newNicCi);
        break;

    }

})(current, previous);
