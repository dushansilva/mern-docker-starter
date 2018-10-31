const acccountStatusTypes = {
    active: 'Active',
    suspended: 'Suspended',
    deactivated: 'Deactivated',
};

const adminAccountTypes = {
    superAdmin: 'Super',
    normalAdmin: 'Normal'
};

const cartStatus = {
    active: 'Active',
    deactivated: 'Deactivated'
};

const orderStatus = {
    new: 'NEW',
    inProgres: 'IN_PROGRESS',
    dispatched: 'DISPATCHED'
};
module.exports = {
    acccountStatusTypes: acccountStatusTypes,
    adminAccountTypes: adminAccountTypes,
    cartStatus: cartStatus,
    orderStatus: orderStatus
};