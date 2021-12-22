(function initCiIpAddresses() {

    // Condition: current.operation() === 'delete' || (current.operation() === 'update' && current.cmdb_ci.changes())

    function _connectNIC(grNic, grCi) {

        if (grNic.isValidRecord() && grCi.isValidRecord()) {

            var grIp = new GlideRecord('cmdb_ci_ip_address');
            grIp.addQuery('nic', grNic.getUniqueValue());
            grIp.query();

            if (grIp.next()) {
                 grCi.setValue('ip_address', grIp.getValue('ip_address'));
                 grCi.setWorkflow(false);
                 grCi.update();
            }

        }

    }

    function _disconnectNIC(grNic, grCi) {

        // Only select the IP addresses from the other NICs
        // attached to the same CI. If we find at least one
        // then fetch it, otherwise clear the CI IP address field

        if (grNic.isValidRecord() && grCi.isValidRecord()) {

            var grIp = new GlideRecord('cmdb_ci_ip_address');
            grIp.addQuery('nic.cmdb_ci', grCi.getUniqueValue());
            grIp.addQuery('nic', '!=', grNic.getUniqueValue());
            grIp.query();

            if (grIp.next()) {
                grCi.setValue('ip_address', grIp.getValue('ip_address'));
            } else {
                grCi.setValue('ip_address', '');
            }

            grCi.setWorkflow(false);
            grCi.update();

        }

    }

    var grNewNicCi;
    var grOldNicCi;

    // Get a GlideRecord on both the current and the previous NIC CI

    grNewNicCi = current.cmdb_ci.getRefRecord();
    if (current.cmdb_ci.changes()) {
        grOldNicCi = previous.cmdb_ci.getRefRecord();
    } else {
        grOldNicCi = grNewNicCi;
    }

    switch (String(current.operation())) {

        // If the NIC has been updated and the target CI has been touched:
        // First remove the IP address linked to this NIC
        // Second attach the same IP address to the new CI

        case 'update':
        if (current.cmdb_ci.changes()) {
            _disconnectNIC(current, grOldNicCi);
        }
        _connectNIC(current, grNewNicCi);
        break;

        // If the NIC has been deleted, the remove/update the IP address that
        // were potentially linked to it (i.e. update the ip_address of the linked CI)

        case 'delete':
        _disconnectNIC(current, grNewNicCi);
        break;

    }

})(current, previous);
