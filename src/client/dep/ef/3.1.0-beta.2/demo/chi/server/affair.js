var database = require('./database');

function getAffair(context) {
    var member = database.members({ id: +context.member }).get()[0];
    var affair = {
        id: +context.id,
        time: context.time,
        member: {
            id: member.id,
            name: member.name
        },
        type: +context.type,
        amount: +context.amount
    };
    affair.balance = affair.type === 0 
        ? member.balance + affair.amount
        : member.balance - affair.amount;

    return affair;
}

exports.list = function (req, res) {
    var page = database.getPage('affairs', req.body.page, req.body.pageSize);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(page));
};

exports.save = function (req, res) {
    var id = database.affairs().count() + 1;
    var affair = getAffair(req.body);
    affair.id = id;
    database.affairs.insert(affair);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
};

exports.update = function (req, res) {
    var affair = getAffair(req.body);
    database.affairs.merge(affair, 'id');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
};

exports.find = function (req, res) {
    var affair = database.affairs({ id: +req.query.id }).get()[0];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(affair));
};