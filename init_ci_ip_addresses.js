(function initCiIpAddresses() {

    // Note 1: the same CI might be updated several times with a different
    // ip address, but this is totally fine; we want one of the ip addresses
    // If time permits, we can implement a cache to prevent useless updates
    // bug given the processing time (< 15.000 records), it's not worth it
    //
    // Note 2: to be decided if we want to keep setWorflow() and autoSysFields()
    
    var grIp = new GlideRecord('cmdb_ci_ip_address');
    grIp.addNotNullQuery('nic');
    grIp.addNotNullQuery('ip_address');
    grIp.query();

    gs.debug('Found ' + grIp.getRowCount() + ' IP addresses');

    while (grIp.next()) {

        var grCi = grIp.nic.cmdb_ci.getRefRecord();
        if (grCi.isValidRecord()) {

            gs.debug('Updating ' + grCi.getValue('name'));
            
            grCi.setValue('ip_address', grIp.getValue('ip_address'));
            grCi.setWorkflow(false);
            grCi.autoSysFields(false);
            grCi.update();
            
        }
    }

})();
